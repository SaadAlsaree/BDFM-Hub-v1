using BDFM.Application.Contract.Identity;
using BDFM.Application.Contracts.Identity;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetUserInbox;

/// <summary>
/// Secure version of GetUserInboxHandler with permission validation
/// </summary>
public class SecureGetUserInboxHandler :
    GetAllWithCountHandler<Correspondence, InboxItemVm, GetUserInboxQuery>,
    IRequestHandler<GetUserInboxQuery, Response<PagedResult<InboxItemVm>>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IPermissionValidationService _permissionValidationService;
    private readonly ILogger<SecureGetUserInboxHandler> _logger;

    // Permission constants for this handler
    private const string PERMISSION_GET_USER_INBOX = "Correspondence|GetUserInbox";
    private const string PERMISSION_VIEW_ALL_CORRESPONDENCE = "Correspondence|ViewAll";
    private const string PERMISSION_VIEW_UNIT_CORRESPONDENCE = "Correspondence|ViewUnit";

    public SecureGetUserInboxHandler(
        IBaseRepository<Correspondence> repository,
        ICurrentUserService currentUserService,
        IPermissionValidationService permissionValidationService,
        ILogger<SecureGetUserInboxHandler> logger) : base(repository)
    {
        _currentUserService = currentUserService ?? throw new ArgumentNullException(nameof(currentUserService));
        _permissionValidationService = permissionValidationService ?? throw new ArgumentNullException(nameof(permissionValidationService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public override Expression<Func<Correspondence, InboxItemVm>> Selector => x => new InboxItemVm
    {
        CorrespondenceId = x.Id,
        Subject = x.Subject,
        CorrespondenceStatus = x.Status == 0 ? CorrespondenceStatusEnum.PendingReferral : x.Status,
        CorrespondenceStatusName = x.Status.GetDisplayName(),
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
            // 1. Validate permissions - user needs at least one of these permissions
            var requiredPermissions = new[]
            {
                PERMISSION_GET_USER_INBOX,
                PERMISSION_VIEW_ALL_CORRESPONDENCE,
                PERMISSION_VIEW_UNIT_CORRESPONDENCE
            };

            var hasPermission = await _permissionValidationService.HasAnyPermissionAsync(requiredPermissions, cancellationToken);

            if (!hasPermission)
            {
                _logger.LogWarning("User {UserId} attempted to access inbox without required permissions",
                    _currentUserService.UserId);

                return Response<PagedResult<InboxItemVm>>.Fail(
                    new List<object> { "Unauthorized access" },
                    new MessageResponse { Code = "Error403", Message = "Access denied. You do not have permission to view correspondence inbox." });
            }

            _logger.LogDebug("Permission validation successful for user {UserId} accessing inbox",
                _currentUserService.UserId);

            // 2. Apply data filtering based on user permissions
            var query = await ApplySecurityFilterAsync(_repository.Query(), cancellationToken);

            // 3. Apply user-specific filtering (from original handler)
            query = query.ApplyFilter(request, _currentUserService.UserId);

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

            _logger.LogInformation("User {UserId} successfully retrieved {ItemCount} inbox items",
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

    /// <summary>
    /// Applies security filtering based on user permissions and hierarchical unit access
    /// </summary>
    /// <param name="query">Base query</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Filtered query based on user permissions</returns>
    private async Task<IQueryable<Correspondence>> ApplySecurityFilterAsync(IQueryable<Correspondence> query, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        // Check if user has permission to view all correspondence (overrides all restrictions)
        var canViewAll = await _permissionValidationService.HasPermissionAsync(PERMISSION_VIEW_ALL_CORRESPONDENCE, cancellationToken);

        if (canViewAll)
        {
            _logger.LogDebug("User {UserId} has permission to view all correspondence", userId);
            return query; // No filtering needed
        }

        // Get all unit IDs the user can access (their unit + all sub-units)
        var accessibleUnitIds = await _permissionValidationService.GetAccessibleUnitIdsAsync(cancellationToken);
        var accessibleUnitIdsList = accessibleUnitIds.ToList();

        if (accessibleUnitIdsList.Any())
        {
            _logger.LogDebug("User {UserId} can access {UnitCount} organizational units", userId, accessibleUnitIdsList.Count);

            // Filter correspondence based on:
            // 1. User is directly involved (primary or secondary recipient)
            // 2. User's accessible units are involved in workflow
            // 3. User has interactions with the correspondence
            return query.Where(c =>
                // Direct user involvement
                c.WorkflowSteps.Any(ws =>
                    (ws.ToPrimaryRecipientType == RecipientTypeEnum.User && ws.ToPrimaryRecipientId == userId) ||
                    ws.SecondaryRecipients.Any(sr => sr.RecipientType == RecipientTypeEnum.User && sr.RecipientId == userId)) ||

                // Unit involvement (user's unit or sub-units)
                c.WorkflowSteps.Any(ws =>
                    (ws.ToPrimaryRecipientType == RecipientTypeEnum.Unit && accessibleUnitIdsList.Contains(ws.ToPrimaryRecipientId)) ||
                    ws.SecondaryRecipients.Any(sr => sr.RecipientType == RecipientTypeEnum.Unit && accessibleUnitIdsList.Contains(sr.RecipientId))) ||

                // User interactions
                c.UserCorrespondenceInteractions.Any(uci => uci.UserId == userId));
        }
        else
        {
            // User doesn't belong to any unit, only show direct user involvement
            _logger.LogDebug("User {UserId} doesn't belong to any organizational unit, showing only direct involvement", userId);

            return query.Where(c =>
                c.WorkflowSteps.Any(ws =>
                    (ws.ToPrimaryRecipientType == RecipientTypeEnum.User && ws.ToPrimaryRecipientId == userId) ||
                    ws.SecondaryRecipients.Any(sr => sr.RecipientType == RecipientTypeEnum.User && sr.RecipientId == userId)) ||
                c.UserCorrespondenceInteractions.Any(uci => uci.UserId == userId));
        }
    }
}
