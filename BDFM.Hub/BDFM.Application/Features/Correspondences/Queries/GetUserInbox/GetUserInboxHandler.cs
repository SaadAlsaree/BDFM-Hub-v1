using BDFM.Application.Contract.Identity;
using BDFM.Application.Contracts.Identity;
using BDFM.Application.Extensions;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetUserInbox
{
    public class GetUserInboxHandler : GetAllWithCountHandler<Correspondence, InboxItemVm, GetUserInboxQuery>, IRequestHandler<GetUserInboxQuery, Response<PagedResult<InboxItemVm>>>
    {
        // get current user
        private readonly ICurrentUserService _currentUserService;
        private readonly IPermissionValidationService _permissionValidationService;
        private readonly ILogger<GetUserInboxHandler> _logger;

        // Permission constants
        private const string PERMISSION_GET_USER_INBOX = "Correspondence|GetUserInbox";
        private const string PERMISSION_VIEW_ALL_CORRESPONDENCE = "Correspondence|ViewAll";

        public GetUserInboxHandler(
            IBaseRepository<Correspondence> repository,
            ICurrentUserService currentUserService,
            IPermissionValidationService permissionValidationService,
            ILogger<GetUserInboxHandler> logger) : base(repository)
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


        public async Task<Response<PagedResult<InboxItemVm>>> Handle(GetUserInboxQuery request, CancellationToken cancellationToken)
        {
            _logger.LogWarning("User {UserId} has Roles: {Roles}", _currentUserService.UserId, string.Join(", ", _currentUserService.GetRoles()));

            try
            {
                // 1. Validate basic permission
                var hasBasicPermission = await _permissionValidationService.HasPermissionAsync(PERMISSION_GET_USER_INBOX, cancellationToken);
                if (!hasBasicPermission)
                {
                    _logger.LogWarning("User {UserId} does not have permission {Permission}", _currentUserService.UserId, PERMISSION_GET_USER_INBOX);
                    return Response<PagedResult<InboxItemVm>>.Fail(
                        new List<object> { "Unauthorized access" },
                        new MessageResponse { Code = "Error403", Message = "Access denied. You do not have permission to access user inbox." });
                }


                // 2. Get user's organizational unit
                var userUnitId = _currentUserService.OrganizationalUnitId;
                if (!userUnitId.HasValue)
                {
                    _logger.LogWarning("User {UserId} does not belong to any organizational unit", _currentUserService.UserId);
                    return Response<PagedResult<InboxItemVm>>.Fail(
                        new List<object> { "User not assigned to unit" },
                        new MessageResponse { Code = "Error400", Message = "User must be assigned to an organizational unit to view correspondence." });
                }

                // 3. Check if user has special roles (SuAdmin or Manager)
                var isSuAdminOrManager = _currentUserService.HasRole("Manager");

                var query = _repository.Query().Where(c => !c.IsDeleted);

                // Get hierarchical unit IDs based on user role
                IEnumerable<Guid> hierarchicalUnitIds;

                if (isSuAdminOrManager)
                {
                    _logger.LogDebug("User {UserId} has Manager role - showing all correspondence in unit hierarchy", _currentUserService.UserId);

                    // Managers/Admins get their unit + all sub-units hierarchically
                    hierarchicalUnitIds = await _permissionValidationService.GetAccessibleUnitIdsAsync(cancellationToken);
                }
                else
                {
                    _logger.LogDebug("User {UserId} has standard access - showing correspondence in their unit only", _currentUserService.UserId);

                    // Standard users: pass user's unit only (will be used for CorrespondenceOrganizationalUnitId check)
                    // The extension will use userUnitId directly for WorkflowSteps checks
                    // We pass hierarchicalUnitIds but it won't be used for standard users in the new logic
                    hierarchicalUnitIds = userUnitId.HasValue
                        ? new[] { userUnitId.Value }
                        : Enumerable.Empty<Guid>();
                }

                // Apply access control using extension method
                query = query.ApplyCorrespondenceAccessControl(
                    _currentUserService.UserId,
                    userUnitId,
                    isSuAdminOrManager,
                    hierarchicalUnitIds);

                // Apply additional filters from the request (skip IsDeleted since we already applied it)
                query = query.ApplyFilter(request, _currentUserService.UserId, applyIsDeletedFilter: false);

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
                    _logger.LogDebug("No correspondence found for user {UserId} with current filters", _currentUserService.UserId);
                    return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<InboxItemVm>>(null!);
                }

                // Set StatusName for each item (if applicable)
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

                _logger.LogDebug("Successfully retrieved {Count} correspondence items for user {UserId}", result.Count, _currentUserService.UserId);
                return SuccessMessage.Get.ToSuccessMessage(pagedResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user inbox for user {UserId}", _currentUserService.UserId);
                return Response<PagedResult<InboxItemVm>>.Fail(
                    new List<object> { "Internal server error" },
                    new MessageResponse { Code = "Error500", Message = "An error occurred while retrieving inbox items" });
            }
        }
    }
}