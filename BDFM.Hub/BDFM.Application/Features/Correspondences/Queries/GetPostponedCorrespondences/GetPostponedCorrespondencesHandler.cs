using BDFM.Application.Contract.Identity;
using BDFM.Application.Contracts.Identity;
using BDFM.Application.Extensions;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetPostponedCorrespondences
{
    public class GetPostponedCorrespondencesHandler : GetAllWithCountHandler<Correspondence, GetPostponedCorrespondencesVm, GetPostponedCorrespondencesQuery>, IRequestHandler<GetPostponedCorrespondencesQuery, Response<PagedResult<GetPostponedCorrespondencesVm>>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IPermissionValidationService _permissionValidationService;

        public GetPostponedCorrespondencesHandler(
            IBaseRepository<Correspondence> repository,
            ICurrentUserService currentUserService,
            IPermissionValidationService permissionValidationService) : base(repository)
        {
            _currentUserService = currentUserService;
            _permissionValidationService = permissionValidationService;
        }

        public override Expression<Func<Correspondence, GetPostponedCorrespondencesVm>> Selector => x => new GetPostponedCorrespondencesVm
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
            CreatedByUnitName = x.CreateByUser != null && x.CreateByUser.OrganizationalUnit != null ? x.CreateByUser.OrganizationalUnit.UnitName : string.Empty,
            ReceivedDate = x.LastUpdateAt ?? x.CreateAt,
            FileId = x.FileId,
            IsDraft = x.IsDraft,
            FileNumber = x.MailFile != null ? x.MailFile.FileNumber : null,
            DueDate = x.WorkflowSteps.Select(y => y.DueDate).FirstOrDefault(),
            PostponedUntil = x.UserCorrespondenceInteractions
                .Where(ui => ui.UserId == _currentUserService.UserId)
                .Select(ui => ui.PostponedUntil)
                .FirstOrDefault(),
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

        public override Func<IQueryable<Correspondence>, IOrderedQueryable<Correspondence>> OrderBy => x => x.OrderByDescending(x => x.CreateAt);

        public async Task<Response<PagedResult<GetPostponedCorrespondencesVm>>> Handle(GetPostponedCorrespondencesQuery request, CancellationToken cancellationToken)
        {
            // Get user info and access control parameters
            var userUnitId = _currentUserService.OrganizationalUnitId;
            var isSuAdminOrManager = _currentUserService.HasRole("SuAdmin") || _currentUserService.HasRole("Manager");
            
            // Get hierarchical unit IDs based on user role
            IEnumerable<Guid> hierarchicalUnitIds;

            if (isSuAdminOrManager)
            {
                // Managers/Admins get their unit + all sub-units hierarchically
                hierarchicalUnitIds = await _permissionValidationService.GetAccessibleUnitIdsAsync(cancellationToken);
            }
            else
            {
                // Standard users: pass user's unit only
                hierarchicalUnitIds = userUnitId.HasValue
                    ? [userUnitId.Value]
                    : Enumerable.Empty<Guid>();
            }

            var query = _repository.Query();

            // Apply access control
            query = query.ApplyCorrespondenceAccessControl(
                _currentUserService.UserId,
                userUnitId,
                isSuAdminOrManager,
                hierarchicalUnitIds);

            // Apply filtering with current user context for postponed correspondences
            query = query.ApplyFilterPostponed(_currentUserService.UserId, request);

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
                return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<GetPostponedCorrespondencesVm>>(null!);

            var pagedResult = new PagedResult<GetPostponedCorrespondencesVm>
            {
                Items = result,
                TotalCount = count
            };

            return SuccessMessage.Get.ToSuccessMessage(pagedResult);
        }
    }
}
