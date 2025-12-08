using BDFM.Application.Contracts.Identity;
using BDFM.Application.Contracts.Persistence;
using BDFM.Application.Contracts.SignalR;
using BDFM.Application.Services;
using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Supporting;
using BDFM.Domain.Enums;

namespace BDFM.Application.Features.Tags.Commands.CreateTag;

public class CreateTagCommandHandler : IRequestHandler<CreateTagCommand, Response<bool>>
{
    private readonly IBaseRepository<Tag> _tagRepository;
    private readonly IBaseRepository<Correspondence> _correspondenceRepository;
    private readonly IBaseRepository<OrganizationalUnit> _organizationalUnitRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAuditTrailService _auditTrailService;
    private readonly ICorrespondenceNotificationService _correspondenceNotificationService;
    private readonly INotificationService _notificationService;

    public CreateTagCommandHandler(
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

    public async Task<Response<bool>> Handle(CreateTagCommand request, CancellationToken cancellationToken)
    {
        // Check if tag already exists
        var existingTag = await _tagRepository.Find(
            t => t.CorrespondenceId == request.CorrespondenceId &&
                 t.Name == request.Name &&
                 t.Category == request.Category &&
                 t.IsAll == request.IsAll &&
                 t.FromUserId == _currentUserService.UserId &&
                 t.FromUnitId == _currentUserService.OrganizationalUnitId &&
                 t.ToPrimaryRecipientId == request.ToPrimaryRecipientId &&
                 t.ToPrimaryRecipientType == request.ToPrimaryRecipientType &&
                 !t.IsDeleted,
            cancellationToken: cancellationToken);

        if (existingTag != null)
        {
            return ErrorsMessage.ExistOnCreate.ToErrorMessage(false);
        }

        // Create new tag
        var tag = new Tag
        {
            Id = Guid.NewGuid(),
            CorrespondenceId = request.CorrespondenceId,
            Name = request.Name,
            Category = request.Category,
            IsAll = request.IsAll,
            FromUserId = _currentUserService.UserId,
            FromUnitId = _currentUserService.OrganizationalUnitId,
            ToPrimaryRecipientId = request.ToPrimaryRecipientId,
            ToPrimaryRecipientType = request.ToPrimaryRecipientType
        };

        var result = await _tagRepository.Create(tag, cancellationToken);

        if (result == null)
        {
            return ErrorsMessage.FailOnCreate.ToErrorMessage(false);
        }

        try
        {
            // Get correspondence for audit log
            var correspondence = await _correspondenceRepository.Find(
                c => c.Id == request.CorrespondenceId,
                cancellationToken: cancellationToken);

            // Create audit log
            if (correspondence != null)
            {
                await _auditTrailService.CreateCorrespondenceAuditLogAsync(
                    "إضافة تحويل",
                    request.CorrespondenceId,
                    _currentUserService.UserId,
                    $"تم إضافة تحويل '{request.Name}' للكتاب برقم {correspondence.MailNum}",
                    "127.0.0.1");
            }

            // Send notifications based on recipient type
            if (request.ToPrimaryRecipientType == RecipientTypeEnum.User)
            {
                // Create persistent notification for user
                var message = correspondence != null
                    ? $"تم إضافة تحويل '{request.Name}' للكتاب: {correspondence.MailNum}"
                    : $"تم إضافة تحويل '{request.Name}'";

                await _notificationService.CreateNotificationAsync(
                    request.ToPrimaryRecipientId,
                    message,
                    NotificationTypeEnum.StatusUpdate,
                    request.CorrespondenceId,
                    null,
                    cancellationToken);

                // Send real-time SignalR notification
                if (correspondence != null)
                {
                    await _correspondenceNotificationService.NotifyCorrespondenceCreatedAsync(
                        request.CorrespondenceId,
                        request.ToPrimaryRecipientId);
                }
            }
            else if (request.ToPrimaryRecipientType == RecipientTypeEnum.Unit)
            {
                // Get organizational unit information
                var organizationalUnit = await _organizationalUnitRepository.Find(
                    ou => ou.Id == request.ToPrimaryRecipientId,
                    cancellationToken: cancellationToken);

                // Create module notifications for unit
                var message = correspondence != null
                    ? $"تم إضافة تحويل '{request.Name}' للكتاب: {correspondence.MailNum}"
                    : $"تم إضافة تحويل '{request.Name}'";

                await _notificationService.CreateModuleNotificationsAsync(
                    request.ToPrimaryRecipientId,
                    message,
                    NotificationTypeEnum.StatusUpdate,
                    request.CorrespondenceId,
                    null,
                    cancellationToken);

                // Send real-time SignalR notification to module
                if (correspondence != null && organizationalUnit != null)
                {
                    await _correspondenceNotificationService.NotifyCorrespondenceAssignedToModuleAsync(
                        request.CorrespondenceId,
                        organizationalUnit.Id,
                        organizationalUnit.UnitName);
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
