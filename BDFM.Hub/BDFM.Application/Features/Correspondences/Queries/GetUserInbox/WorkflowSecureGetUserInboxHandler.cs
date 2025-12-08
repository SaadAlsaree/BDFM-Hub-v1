using BDFM.Application.Contract.Identity;
using BDFM.Application.Contracts.Identity;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetUserInbox;

/// <summary>
/// Secure handler that implements workflow-based permission filtering.
/// Users can only see correspondence where they are involved in WorkflowSteps.
/// Each user/unit sees only their own WorkflowSteps within the correspondence.
/// </summary>
public class WorkflowSecureGetUserInboxHandler :
    GetAllWithCountHandler<Correspondence, InboxItemVm, GetUserInboxQuery>,
    IRequestHandler<GetUserInboxQuery, Response<PagedResult<InboxItemVm>>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IPermissionValidationService _permissionValidationService;
    private readonly ILogger<WorkflowSecureGetUserInboxHandler> _logger;

    // Permission constants
    private const string PERMISSION_GET_USER_INBOX = "Correspondence|GetUserInbox";
    private const string PERMISSION_VIEW_ALL_CORRESPONDENCE = "Correspondence|ViewAll";

    public WorkflowSecureGetUserInboxHandler(
        IBaseRepository<Correspondence> repository,
        ICurrentUserService currentUserService,
        IPermissionValidationService permissionValidationService,
        ILogger<WorkflowSecureGetUserInboxHandler> logger) : base(repository)
    {
        _currentUserService = currentUserService ?? throw new ArgumentNullException(nameof(currentUserService));
        _permissionValidationService = permissionValidationService ?? throw new ArgumentNullException(nameof(permissionValidationService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public override Expression<Func<Correspondence, InboxItemVm>> Selector => x => new InboxItemVm
    {
        CorrespondenceId = x.Id,
        Subject = x.Subject,
        PriorityLevel = x.PriorityLevel == 0 ? PriorityLevelEnum.Normal : x.PriorityLevel,
        PriorityLevelName = x.PriorityLevel.GetDisplayName(),
        SecrecyLevel = x.SecrecyLevel == 0 ? SecrecyLevelEnum.None : x.SecrecyLevel,
        SecrecyLevelName = x.SecrecyLevel.GetDisplayName(),
        CorrespondenceType = x.CorrespondenceType,
        CorrespondenceTypeName = x.CorrespondenceType.GetDisplayName(),
        WorkflowStepId = x.WorkflowSteps.Select(y => y.Id).FirstOrDefault(),
        MailNum = x.MailNum,
        MailDate = x.MailDate,
        ExternalReferenceNumber = x.ExternalReferenceNumber!,
        ReceivedDate = x.LastUpdateAt ?? x.CreateAt,
        FileId = x.FileId,
        IsDraft = x.IsDraft,
        FileNumber = x.MailFile != null ? x.MailFile.FileNumber : null,
        DueDate = x.WorkflowSteps.Select(y => y.DueDate).FirstOrDefault(),
        UnreadCount = x.UserCorrespondenceInteractions.Count(y => y.IsRead == false),
        PostponedUntilCount = x.UserCorrespondenceInteractions.Count(y => y.PostponedUntil.HasValue && y.PostponedUntil.Value > DateTime.UtcNow),
        InTrashCount = x.UserCorrespondenceInteractions.Count(y => y.IsInTrash),
        StarredCount = x.UserCorrespondenceInteractions.Count(y => y.IsStarred),
        DueDateCount = x.WorkflowSteps.Count(y => y.DueDate.HasValue && y.DueDate.Value > DateTime.UtcNow),
        UserCorrespondenceInteraction = x.UserCorrespondenceInteractions.Select(y => new UserCorrespondenceInteractionDto
        {
            UserId = y.UserId,
            CorrespondenceId = y.CorrespondenceId,
            IsStarred = y.IsStarred,
            IsInTrash = y.IsInTrash,
            IsRead = y.IsRead,
            LastReadAt = y.LastReadAt,
            PostponedUntil = y.PostponedUntil,
            ReceiveNotifications = y.ReceiveNotifications
        }).FirstOrDefault(u => u.UserId == _currentUserService.UserId && u.CorrespondenceId == x.Id) ?? new UserCorrespondenceInteractionDto()
    };

    public override Func<IQueryable<Correspondence>, IOrderedQueryable<Correspondence>> OrderBy =>
        x => x.OrderByDescending(x => x.CreateAt);

    public async Task<Response<PagedResult<InboxItemVm>>> Handle(GetUserInboxQuery request, CancellationToken cancellationToken)
    {
        try
        {
            // 1. Validate permissions first
            var hasPermission = await _permissionValidationService.HasPermissionAsync(PERMISSION_GET_USER_INBOX, cancellationToken);

            if (!hasPermission)
            {
                _logger.LogWarning("User {UserId} attempted to access inbox without required permissions",
                    _currentUserService.UserId);

                return Response<PagedResult<InboxItemVm>>.Fail(
                    new List<object> { "Unauthorized access" },
                    new MessageResponse { Code = "Error403", Message = "Access denied. You do not have permission to view correspondence inbox." });
            }

            _logger.LogInformation("Processing workflow-based secure inbox request for user {UserId}", _currentUserService.UserId);

            // 2. Apply workflow-based security filtering using optimized service method
            var query = await _permissionValidationService.ApplyWorkflowAccessFilterAsync(_repository.Query(), cancellationToken);

            // 3. Apply user-specific filtering (from original handler)
            query = query.ApplyFilterUserInbox(request, _currentUserService.UserId);

            // 4. Apply ordering
            var orderedQuery = OrderBy(query);

            // 5. Apply pagination and get results
            var result = await orderedQuery
                .ApplyPagination(request)
                .Select(Selector)
                .ToListAsync(cancellationToken);

            // 6. Get count (without pagination)
            var count = await query.CountAsync(cancellationToken);

            if (!result.Any())
                return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<InboxItemVm>>(null!);

            // 7. Set StatusName for each item (if applicable)
            result.ToList().ForEach(x =>
            {
                try
                {
                    if ((x as dynamic)?.Status != null)
                        (x as dynamic).StatusName = ((Status)(x as dynamic).Status).GetDisplayName();
                }
                catch
                {
                    // Ignore if Status property doesn't exist
                }
            });

            var pagedResult = new PagedResult<InboxItemVm>
            {
                Items = result,
                TotalCount = count
            };

            _logger.LogInformation("User {UserId} successfully retrieved {ItemCount} inbox items with workflow-based filtering",
                _currentUserService.UserId, result.Count);

            return SuccessMessage.Get.ToSuccessMessage(pagedResult);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt by user {UserId}", _currentUserService.UserId);
            return Response<PagedResult<InboxItemVm>>.Fail(
                new List<object> { "Unauthorized access" },
                new MessageResponse { Code = "Error403", Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving inbox for user {UserId}", _currentUserService.UserId);
            return Response<PagedResult<InboxItemVm>>.Fail(
                new List<object> { "Internal server error" },
                new MessageResponse { Code = "Error500", Message = "An error occurred while retrieving inbox items" });
        }
    }


}
