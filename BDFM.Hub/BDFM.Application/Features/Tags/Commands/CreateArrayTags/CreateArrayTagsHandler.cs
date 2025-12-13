using BDFM.Application.Contracts.Identity;
using BDFM.Application.Contracts.SignalR;
using BDFM.Application.Services;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.Tags.Commands.CreateArrayTags;

public class CreateArrayTagsHandler : IRequestHandler<CreateArrayTagsCommand, Response<bool>>
{
    private readonly IBaseRepository<Tag> _tagRepository;
    private readonly IBaseRepository<Correspondence> _correspondenceRepository;
    private readonly IBaseRepository<OrganizationalUnit> _organizationalUnitRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAuditTrailService _auditTrailService;
    private readonly ICorrespondenceNotificationService _correspondenceNotificationService;
    private readonly INotificationService _notificationService;

    public CreateArrayTagsHandler(
        IBaseRepository<Tag> tagRepository,
        IBaseRepository<Correspondence> correspondenceRepository,
        IBaseRepository<OrganizationalUnit> organizationalUnitRepository,
        ICurrentUserService currentUserService,
        IAuditTrailService auditTrailService,
        ICorrespondenceNotificationService correspondenceNotificationService,
        INotificationService notificationService)
    {
        _tagRepository = tagRepository;
        _correspondenceRepository = correspondenceRepository;
        _organizationalUnitRepository = organizationalUnitRepository;
        _currentUserService = currentUserService;
        _auditTrailService = auditTrailService;
        _correspondenceNotificationService = correspondenceNotificationService;
        _notificationService = notificationService;
    }

    public async Task<Response<bool>> Handle(CreateArrayTagsCommand request, CancellationToken cancellationToken)
    {
        // Validate Data list is not empty
        if (request.Data == null || request.Data.Count == 0)
        {
            return ErrorsMessage.FailOnCreate.ToErrorMessage(false);
        }

        // Get correspondence for audit log and notifications
        var correspondence = await _correspondenceRepository.Find(
            c => c.Id == request.CorrespondenceId,
            cancellationToken: cancellationToken);

        if (correspondence == null)
        {
            return ErrorsMessage.NotFoundData.ToErrorMessage(false);
        }

        var tagsToCreate = new List<Tag>();

        // Process each tag
        foreach (var dataItem in request.Data)
        {
            // Check if tag already exists
            var existingTag = await _tagRepository.Find(
                t => t.CorrespondenceId == request.CorrespondenceId &&
                     t.Name == dataItem.Name &&
                     t.Category == dataItem.Category &&
                     t.IsAll == request.IsAll &&
                     t.FromUserId == _currentUserService.UserId &&
                     t.FromUnitId == _currentUserService.OrganizationalUnitId &&
                     t.ToPrimaryRecipientId == dataItem.ToPrimaryRecipientId &&
                     t.ToPrimaryRecipientType == dataItem.ToPrimaryRecipientType &&
                     !t.IsDeleted,
                cancellationToken: cancellationToken);

            if (existingTag != null)
            {
                // Skip duplicate tags, continue with next
                continue;
            }

            // Create new tag
            var tag = new Tag
            {
                Id = Guid.NewGuid(),
                CorrespondenceId = request.CorrespondenceId,
                Name = dataItem.Name,
                Category = dataItem.Category,
                IsAll = request.IsAll,
                FromUserId = _currentUserService.UserId,
                FromUnitId = _currentUserService.OrganizationalUnitId,
                ToPrimaryRecipientId = dataItem.ToPrimaryRecipientId,
                ToPrimaryRecipientType = dataItem.ToPrimaryRecipientType
            };

            tagsToCreate.Add(tag);
        }

        if (tagsToCreate.Count == 0)
        {
            return ErrorsMessage.ExistOnCreate.ToErrorMessage(false);
        }

        // Create tags in batch
        var result = await _tagRepository.CreateRange(tagsToCreate, cancellationToken: cancellationToken);

        if (!result)
        {
            return ErrorsMessage.FailOnCreate.ToErrorMessage(false);
        }

        try
        {
            // Create audit logs for all created tags
            var tagNames = string.Join(", ", tagsToCreate.Select(t => $"'{t.Name}'"));
            await _auditTrailService.CreateCorrespondenceAuditLogAsync(
                "إضافة تحويلات",
                request.CorrespondenceId,
                _currentUserService.UserId,
                $"تم إضافة تحويلات ({tagsToCreate.Count}): {tagNames} للكتاب برقم {correspondence.MailNum}",
                "127.0.0.1");

            // Send notifications for each tag
            var processedRecipients = new HashSet<(RecipientTypeEnum Type, Guid Id)>();

            for (int i = 0; i < tagsToCreate.Count; i++)
            {
                var tag = tagsToCreate[i];
                var recipientKey = (tag.ToPrimaryRecipientType, tag.ToPrimaryRecipientId);

                // Avoid duplicate notifications for the same recipient
                if (processedRecipients.Contains((tag.ToPrimaryRecipientType ?? RecipientTypeEnum.User, tag.ToPrimaryRecipientId ?? Guid.Empty)))
                {
                    continue;
                }

                processedRecipients.Add((tag.ToPrimaryRecipientType ?? RecipientTypeEnum.User, tag.ToPrimaryRecipientId ?? Guid.Empty));

                var message = $"تم إضافة تحويل '{tag.Name}' للكتاب: {correspondence.MailNum}";

                if (tag.ToPrimaryRecipientType == RecipientTypeEnum.User)
                {
                    // Create persistent notification for user
                    await _notificationService.CreateNotificationAsync(
                        tag.ToPrimaryRecipientId ?? Guid.Empty,
                        message,
                        NotificationTypeEnum.StatusUpdate,
                        request.CorrespondenceId,
                        null,
                        cancellationToken);

                    // Send real-time SignalR notification
                    await _correspondenceNotificationService.NotifyCorrespondenceCreatedAsync(
                        request.CorrespondenceId,
                        tag.ToPrimaryRecipientId);
                }
                else if (tag.ToPrimaryRecipientType == RecipientTypeEnum.Unit)
                {
                    // Get organizational unit information
                    var organizationalUnit = await _organizationalUnitRepository.Find(
                        ou => ou.Id == tag.ToPrimaryRecipientId,
                        cancellationToken: cancellationToken);

                    if (organizationalUnit != null)
                    {
                        // Create module notifications for unit
                        await _notificationService.CreateModuleNotificationsAsync(
                            tag.ToPrimaryRecipientId ?? Guid.Empty,
                            message,
                            NotificationTypeEnum.StatusUpdate,
                            request.CorrespondenceId,
                            null,
                            cancellationToken);

                        // Send real-time SignalR notification to module
                        await _correspondenceNotificationService.NotifyCorrespondenceAssignedToModuleAsync(
                            request.CorrespondenceId,
                            organizationalUnit.Id,
                            organizationalUnit.UnitName);
                    }
                }
            }

            // Notify inbox update
            await _correspondenceNotificationService.NotifyInboxUpdateAsync();
        }
        catch
        {
            // Swallow notification errors to avoid failing the tag creation
        }

        return Response<bool>.Success(true, new MessageResponse { Code = "Succeeded", Message = "" });
    }
}
