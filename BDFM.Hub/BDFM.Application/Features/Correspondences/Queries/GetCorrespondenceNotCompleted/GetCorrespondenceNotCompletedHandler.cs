using BDFM.Application.Contract.Identity;
using BDFM.Application.Contracts.Identity;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Enums;

namespace BDFM.Application.Features.Correspondences.Queries.GetCorrespondenceNotCompleted
{
    public class GetCorrespondenceNotCompletedHandler : GetAllWithCountHandler<Correspondence, CorrespondenceNotCompletedVm, GetCorrespondenceNotCompletedQuery>, IRequestHandler<GetCorrespondenceNotCompletedQuery, Response<PagedResult<CorrespondenceNotCompletedVm>>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IPermissionValidationService _permissionValidationService;
        private readonly ILogger<GetCorrespondenceNotCompletedHandler> _logger;

        // Permission constants
         private const string PERMISSION_GET_USER_INBOX = "Correspondence|GetUserInbox";
        private const string PERMISSION_VIEW_ALL_CORRESPONDENCE = "Correspondence|ViewAll";

        public GetCorrespondenceNotCompletedHandler(
            IBaseRepository<Correspondence> repository,
            ICurrentUserService currentUserService,
            IPermissionValidationService permissionValidationService,
            ILogger<GetCorrespondenceNotCompletedHandler> logger) : base(repository)
        {
            _currentUserService = currentUserService ?? throw new ArgumentNullException(nameof(currentUserService));
            _permissionValidationService = permissionValidationService ?? throw new ArgumentNullException(nameof(permissionValidationService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public override Expression<Func<Correspondence, CorrespondenceNotCompletedVm>> Selector => x => new CorrespondenceNotCompletedVm
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
            WorkflowStepId = x.WorkflowSteps.Where(y => y.DueDate.HasValue).Select(y => y.Id).FirstOrDefault(),
            MailNum = x.MailNum,
            MailDate = x.MailDate,
            ExternalReferenceNumber = x.ExternalReferenceNumber!,
            ExternalReferenceDate = x.ExternalReferenceDate.HasValue ? x.ExternalReferenceDate.Value.ToDateTime(TimeOnly.MinValue) : DateTime.MinValue,
            CreatedByUnitName = x.CreateByUser != null && x.CreateByUser.OrganizationalUnit != null ? x.CreateByUser.OrganizationalUnit.UnitName : string.Empty,
            ReceivedDate = x.LastUpdateAt ?? x.CreateAt,
            FileId = x.FileId,
            IsDraft = x.IsDraft,
            FileNumber = x.MailFile != null ? x.MailFile.FileNumber : null,
            DueDate = x.WorkflowSteps.Where(y => y.DueDate.HasValue).Select(y => y.DueDate).FirstOrDefault(),
            Status = x.WorkflowSteps.Where(y => y.DueDate.HasValue).Select(y => y.Status).FirstOrDefault(),
            WorkflowStepStatusName = x.WorkflowSteps.Where(y => y.DueDate.HasValue).Select(y => y.Status.GetDisplayName()).FirstOrDefault() ?? string.Empty,
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

        public async Task<Response<PagedResult<CorrespondenceNotCompletedVm>>> Handle(GetCorrespondenceNotCompletedQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // 1. Validate basic permission
                var hasBasicPermission = await _permissionValidationService.HasPermissionAsync(PERMISSION_GET_USER_INBOX, cancellationToken);
                if (!hasBasicPermission)
                {
                    _logger.LogWarning("User {UserId} does not have permission {Permission}", _currentUserService.UserId, PERMISSION_GET_USER_INBOX);
                    return Response<PagedResult<CorrespondenceNotCompletedVm>>.Fail(
                        new List<object> { "Unauthorized access" },
                        new MessageResponse { Code = "Error403", Message = "Access denied. You do not have permission to access this correspondence." });
                }

                // 2. Check if user has ViewAll permission (managers, etc.)
                var canViewAll = await _permissionValidationService.HasPermissionAsync(PERMISSION_VIEW_ALL_CORRESPONDENCE, cancellationToken);

                var query = _repository.Query();

                if (canViewAll)
                {
                    _logger.LogDebug("User {UserId} has ViewAll permission - showing all correspondence with status PendingReferral or UnderProcessing", _currentUserService.UserId);
                    // User can see all correspondence - apply only the basic filters
                    query = query.ApplyFilter(request);
                }
                else
                {
                    _logger.LogDebug("User {UserId} has limited access - applying workflow-based filtering for correspondence with status PendingReferral or UnderProcessing", _currentUserService.UserId);

                    // 3. Get user's accessible unit IDs (their unit + sub-units, NOT parent units)
                    var accessibleUnitIds = await _permissionValidationService.GetAccessibleUnitIdsAsync(cancellationToken);
                    var userUnitId = _currentUserService.OrganizationalUnitId;

                    // 4. Apply workflow-based access control
                    // Standard users can only see correspondence from their own unit via workflow steps
                    query = query.Where(c => !c.IsDeleted && (
                        // User created the correspondence (creators can see their own correspondence regardless of workflow)
                        c.CreateBy == _currentUserService.UserId ||

                        // For correspondence NOT created by the user, check workflow participation
                        (c.CreateBy != _currentUserService.UserId &&
                         c.WorkflowSteps.Any(ws =>
                            // Primary recipient is the user
                            (ws.ToPrimaryRecipientType == RecipientTypeEnum.User && ws.ToPrimaryRecipientId == _currentUserService.UserId) ||

                            // Primary recipient is user's exact unit (not parent/child units)
                            (ws.ToPrimaryRecipientType == RecipientTypeEnum.Unit && userUnitId.HasValue && ws.ToPrimaryRecipientId == userUnitId.Value) ||

                            // User is a secondary recipient
                            ws.SecondaryRecipients.Any(sr =>
                                (sr.RecipientType == RecipientTypeEnum.User && sr.RecipientId == _currentUserService.UserId) ||
                                (sr.RecipientType == RecipientTypeEnum.Unit && userUnitId.HasValue && sr.RecipientId == userUnitId.Value)
                            ) ||

                            // User has WorkflowStepInteraction access (forwarded within module)
                            ws.Interactions.Any(wsi => wsi.InteractingUserId == _currentUserService.UserId)
                         )
                        )
                    ));

                    // Apply additional filters from the request (skip IsDeleted since we already applied it)
                    query = query.ApplyFilterCorrespondenceNotCompleted(request);
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
                    _logger.LogDebug("No correspondence with status PendingReferral or UnderProcessing found for user {UserId} with current filters", _currentUserService.UserId);
                    return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<CorrespondenceNotCompletedVm>>(null!);
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

                var pagedResult = new PagedResult<CorrespondenceNotCompletedVm>
                {
                    Items = result,
                    TotalCount = count
                };

                _logger.LogDebug("Successfully retrieved {Count} correspondence items with status PendingReferral or UnderProcessing for user {UserId}", result.Count, _currentUserService.UserId);
                return SuccessMessage.Get.ToSuccessMessage(pagedResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving correspondence with status PendingReferral or UnderProcessing for user {UserId}", _currentUserService.UserId);
                return Response<PagedResult<CorrespondenceNotCompletedVm>>.Fail(
                    new List<object> { "Internal server error" },
                    new MessageResponse { Code = "Error500", Message = "An error occurred while retrieving correspondence with status PendingReferral or UnderProcessing" });
            }
        }
    }
}

