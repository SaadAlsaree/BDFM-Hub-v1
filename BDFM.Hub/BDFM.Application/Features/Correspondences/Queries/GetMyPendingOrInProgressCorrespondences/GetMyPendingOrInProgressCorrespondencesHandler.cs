using BDFM.Application.Contract.Identity;
using BDFM.Application.Contracts.Identity;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Enums;

namespace BDFM.Application.Features.Correspondences.Queries.GetMyPendingOrInProgressCorrespondences
{
    public class GetMyPendingOrInProgressCorrespondencesHandler : GetAllWithCountHandler<Correspondence, MyPendingOrInProgressCorrespondencesVm, GetMyPendingOrInProgressCorrespondencesQuery>, IRequestHandler<GetMyPendingOrInProgressCorrespondencesQuery, Response<PagedResult<MyPendingOrInProgressCorrespondencesVm>>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IPermissionValidationService _permissionValidationService;
        private readonly ILogger<GetMyPendingOrInProgressCorrespondencesHandler> _logger;

        // Permission constants
        private const string PERMISSION_GET_USER_INBOX = "Correspondence|GetUserInbox";
        private const string PERMISSION_VIEW_ALL_CORRESPONDENCE = "Correspondence|ViewAll";

        public GetMyPendingOrInProgressCorrespondencesHandler(
            IBaseRepository<Correspondence> repository,
            ICurrentUserService currentUserService,
            IPermissionValidationService permissionValidationService,
            ILogger<GetMyPendingOrInProgressCorrespondencesHandler> logger) : base(repository)
        {
            _currentUserService = currentUserService ?? throw new ArgumentNullException(nameof(currentUserService));
            _permissionValidationService = permissionValidationService ?? throw new ArgumentNullException(nameof(permissionValidationService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public override Expression<Func<Correspondence, MyPendingOrInProgressCorrespondencesVm>> Selector => x => new MyPendingOrInProgressCorrespondencesVm
        {
            CorrespondenceId = x.Id,
            Subject = x.Subject,
            PriorityLevel = x.PriorityLevel == 0 ? PriorityLevelEnum.Normal : x.PriorityLevel,
            PriorityLevelName = x.PriorityLevel.GetDisplayName(),
            SecrecyLevel = x.SecrecyLevel == 0 ? SecrecyLevelEnum.None : x.SecrecyLevel,
            SecrecyLevelName = x.SecrecyLevel.GetDisplayName(),
            CorrespondenceType = x.CorrespondenceType,
            CorrespondenceTypeName = x.CorrespondenceType.GetDisplayName(),
            CorrespondenceStatus = x.Status == 0 ? CorrespondenceStatusEnum.PendingReferral : x.Status,
            CorrespondenceStatusName = x.Status.GetDisplayName(),
            WorkflowStepId = x.WorkflowSteps.Where(y => (y.Status == WorkflowStepStatus.Pending || y.Status == WorkflowStepStatus.InProgress) &&
                ((y.ToPrimaryRecipientType == RecipientTypeEnum.User && y.ToPrimaryRecipientId == _currentUserService.UserId) ||
                 (y.ToPrimaryRecipientType == RecipientTypeEnum.Unit && _currentUserService.OrganizationalUnitId.HasValue && y.ToPrimaryRecipientId == _currentUserService.OrganizationalUnitId.Value) ||
                 y.SecondaryRecipients.Any(sr => (sr.RecipientType == RecipientTypeEnum.User && sr.RecipientId == _currentUserService.UserId) ||
                                                  (sr.RecipientType == RecipientTypeEnum.Unit && _currentUserService.OrganizationalUnitId.HasValue && sr.RecipientId == _currentUserService.OrganizationalUnitId.Value)))).Select(y => y.Id).FirstOrDefault(),
            MailNum = x.MailNum,
            MailDate = x.MailDate,
            ExternalReferenceNumber = x.ExternalReferenceNumber!,
            ExternalReferenceDate = x.ExternalReferenceDate.HasValue ? x.ExternalReferenceDate.Value.ToDateTime(TimeOnly.MinValue) : DateTime.MinValue,
            CreatedByUnitName = x.CreateByUser != null && x.CreateByUser.OrganizationalUnit != null ? x.CreateByUser.OrganizationalUnit.UnitName : string.Empty,
            ReceivedDate = x.LastUpdateAt ?? x.CreateAt,
            FileId = x.FileId,
            IsDraft = x.IsDraft,
            FileNumber = x.MailFile != null ? x.MailFile.FileNumber : null,
            DueDate = x.WorkflowSteps.Where(y => (y.Status == WorkflowStepStatus.Pending || y.Status == WorkflowStepStatus.InProgress) &&
                ((y.ToPrimaryRecipientType == RecipientTypeEnum.User && y.ToPrimaryRecipientId == _currentUserService.UserId) ||
                 (y.ToPrimaryRecipientType == RecipientTypeEnum.Unit && _currentUserService.OrganizationalUnitId.HasValue && y.ToPrimaryRecipientId == _currentUserService.OrganizationalUnitId.Value) ||
                 y.SecondaryRecipients.Any(sr => (sr.RecipientType == RecipientTypeEnum.User && sr.RecipientId == _currentUserService.UserId) ||
                                                (sr.RecipientType == RecipientTypeEnum.Unit && _currentUserService.OrganizationalUnitId.HasValue && sr.RecipientId == _currentUserService.OrganizationalUnitId.Value))) && y.DueDate.HasValue).Select(y => y.DueDate).FirstOrDefault(),
            Status = x.WorkflowSteps.Where(y => (y.Status == WorkflowStepStatus.Pending || y.Status == WorkflowStepStatus.InProgress) &&
                ((y.ToPrimaryRecipientType == RecipientTypeEnum.User && y.ToPrimaryRecipientId == _currentUserService.UserId) ||
                 (y.ToPrimaryRecipientType == RecipientTypeEnum.Unit && _currentUserService.OrganizationalUnitId.HasValue && y.ToPrimaryRecipientId == _currentUserService.OrganizationalUnitId.Value) ||
                 y.SecondaryRecipients.Any(sr => (sr.RecipientType == RecipientTypeEnum.User && sr.RecipientId == _currentUserService.UserId) ||
                                                (sr.RecipientType == RecipientTypeEnum.Unit && _currentUserService.OrganizationalUnitId.HasValue && sr.RecipientId == _currentUserService.OrganizationalUnitId.Value)))).Select(y => y.Status).FirstOrDefault(),
            WorkflowStepStatusName = x.WorkflowSteps.Where(y => (y.Status == WorkflowStepStatus.Pending || y.Status == WorkflowStepStatus.InProgress) &&
                ((y.ToPrimaryRecipientType == RecipientTypeEnum.User && y.ToPrimaryRecipientId == _currentUserService.UserId) ||
                 (y.ToPrimaryRecipientType == RecipientTypeEnum.Unit && _currentUserService.OrganizationalUnitId.HasValue && y.ToPrimaryRecipientId == _currentUserService.OrganizationalUnitId.Value) ||
                 y.SecondaryRecipients.Any(sr => (sr.RecipientType == RecipientTypeEnum.User && sr.RecipientId == _currentUserService.UserId) ||
                                                (sr.RecipientType == RecipientTypeEnum.Unit && _currentUserService.OrganizationalUnitId.HasValue && sr.RecipientId == _currentUserService.OrganizationalUnitId.Value)))).Select(y => y.Status.GetDisplayName()).FirstOrDefault() ?? string.Empty,
            UnreadCount = x.UserCorrespondenceInteractions.Count(y => y.IsRead == false),
            PostponedUntilCount = x.UserCorrespondenceInteractions.Count(y => y.PostponedUntil.HasValue && y.PostponedUntil.Value > DateTime.UtcNow),
            InTrashCount = x.UserCorrespondenceInteractions.Count(y => y.IsInTrash),
            StarredCount = x.UserCorrespondenceInteractions.Count(y => y.IsStarred),
            DueDateCount = x.WorkflowSteps.Count(y => y.DueDate.HasValue && y.DueDate.Value > DateTime.UtcNow),
            UserCorrespondenceInteraction = x.UserCorrespondenceInteractions.Where(y => y.UserId == _currentUserService.UserId).Select(y => new UserCorrespondenceInteractionDto
            {
                UserId = y.UserId,
                CorrespondenceId = y.CorrespondenceId,
                IsStarred = y.IsStarred,
                IsInTrash = y.IsInTrash,
                IsRead = y.IsRead,
                LastReadAt = y.LastReadAt,
                PostponedUntil = y.PostponedUntil,
                ReceiveNotifications = y.ReceiveNotifications

            }).FirstOrDefault() ?? new UserCorrespondenceInteractionDto
            {
                UserId = _currentUserService.UserId,
                CorrespondenceId = x.Id
            }
        };

        public override Func<IQueryable<Correspondence>, IOrderedQueryable<Correspondence>> OrderBy => x => x.OrderByDescending(x => x.CreateAt);

        public async Task<Response<PagedResult<MyPendingOrInProgressCorrespondencesVm>>> Handle(GetMyPendingOrInProgressCorrespondencesQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // 1. Validate basic permission
                var hasBasicPermission = await _permissionValidationService.HasPermissionAsync(PERMISSION_GET_USER_INBOX, cancellationToken);
                if (!hasBasicPermission)
                {
                    _logger.LogWarning("User {UserId} does not have permission {Permission}", _currentUserService.UserId, PERMISSION_GET_USER_INBOX);
                    return Response<PagedResult<MyPendingOrInProgressCorrespondencesVm>>.Fail(
                        new List<object> { "Unauthorized access" },
                        new MessageResponse { Code = "Error403", Message = "Access denied. You do not have permission to access this correspondence." });
                }

                // 2. Check if user has ViewAll permission (managers, etc.)
                var canViewAll = await _permissionValidationService.HasPermissionAsync(PERMISSION_VIEW_ALL_CORRESPONDENCE, cancellationToken);

                var query = _repository.Query();
                var userUnitId = _currentUserService.OrganizationalUnitId;

                if (canViewAll)
                {
                    _logger.LogDebug("User {UserId} has ViewAll permission - showing all correspondence with pending/in-progress workflow steps directed to users/units", _currentUserService.UserId);
                    
                    // For ViewAll users, show all correspondence with pending/in-progress workflow steps (regardless of recipient)
                    query = query.Where(c => !c.IsDeleted && 
                        c.WorkflowSteps.Any(ws => 
                        ws.IsActive &&
                            (ws.Status == WorkflowStepStatus.Pending || ws.Status == WorkflowStepStatus.InProgress)
                        ));
                    
                    // Apply additional filters from the request
                    query = query.ApplyFilterMyPendingOrInProgressCorrespondences(request);
                }
                else
                {
                    _logger.LogDebug("User {UserId} has limited access - filtering correspondence with pending/in-progress workflow steps directed to them or their unit", _currentUserService.UserId);

                    if (!userUnitId.HasValue)
                    {
                        _logger.LogWarning("User {UserId} is not assigned to a unit", _currentUserService.UserId);
                        return Response<PagedResult<MyPendingOrInProgressCorrespondencesVm>>.Fail(
                            new List<object> { "User not assigned to unit" },
                            new MessageResponse { Code = "Error400", Message = "User must be assigned to an organizational unit to view pending/in-progress correspondence." });
                    }

                    // Filter correspondences that have WorkflowSteps directed to the current user or their unit
                    // AND these WorkflowSteps must have Status = Pending or InProgress
                    query = query.Where(c => !c.IsDeleted && c.WorkflowSteps.Any(ws => 
                        ws.IsActive &&
                        (ws.Status == WorkflowStepStatus.Pending || ws.Status == WorkflowStepStatus.InProgress) &&
                        (
                            // Case A: Forwarded to current user personally
                            (ws.ToPrimaryRecipientType == RecipientTypeEnum.User &&
                             ws.ToPrimaryRecipientId == _currentUserService.UserId) ||
                            
                            // Case B: Forwarded to user's unit only (not hierarchical)
                            (ws.ToPrimaryRecipientType == RecipientTypeEnum.Unit &&
                             ws.ToPrimaryRecipientId == userUnitId.Value) ||
                            
                            // Case C: User is secondary recipient
                            ws.SecondaryRecipients.Any(sr => 
                                sr.RecipientType == RecipientTypeEnum.User && 
                                sr.RecipientId == _currentUserService.UserId) ||
                            
                            // Case D: User's unit is secondary recipient
                            ws.SecondaryRecipients.Any(sr => 
                                sr.RecipientType == RecipientTypeEnum.Unit && 
                                sr.RecipientId == userUnitId.Value)
                        )
                    ));

                    // Apply additional filters from the request (skip IsDeleted since we already applied it)
                    query = query.ApplyFilter(request);
                }

                // Apply ordering
                var orderedQuery = OrderBy(query);

                // Apply pagination and get results
                var result = await orderedQuery
                    .ApplyPagination(request)
                    .Select(Selector)
                    .ToListAsync(cancellationToken);

                // Get count (without pagination)
                var count = await query.CountAsync(cancellationToken);

                if (!result.Any())
                {
                    _logger.LogDebug("No correspondence with pending/in-progress workflow steps directed to user {UserId} or their unit found with current filters", _currentUserService.UserId);
                    return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<MyPendingOrInProgressCorrespondencesVm>>(null!);
                }

                // Set StatusName for each item (if applicable)
                result.ToList().ForEach(x =>
                {
                    try
                    {
                        if ((x as dynamic)?.Status != null)
                            (x as dynamic).StatusName = ((WorkflowStepStatus)(x as dynamic).Status).GetDisplayName();
                    }
                    catch
                    {
                        // Ignore if Status property doesn't exist
                    }
                });

                var pagedResult = new PagedResult<MyPendingOrInProgressCorrespondencesVm>
                {
                    Items = result,
                    TotalCount = count
                };

                _logger.LogDebug("Successfully retrieved {Count} correspondence items with pending/in-progress workflow steps directed to user {UserId} or their unit", result.Count, _currentUserService.UserId);
                return SuccessMessage.Get.ToSuccessMessage(pagedResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving correspondence with pending/in-progress workflow steps directed to user {UserId} or their unit", _currentUserService.UserId);
                return Response<PagedResult<MyPendingOrInProgressCorrespondencesVm>>.Fail(
                    new List<object> { "Internal server error" },
                    new MessageResponse { Code = "Error500", Message = "An error occurred while retrieving correspondence with pending/in-progress workflow steps" });
            }
        }
    }
}

