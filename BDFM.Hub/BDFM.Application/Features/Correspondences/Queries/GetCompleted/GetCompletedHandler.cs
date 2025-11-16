using BDFM.Application.Contract.Identity;
using BDFM.Application.Contracts.Identity;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Application.Extensions;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetCompleted
{
    public class GetCompletedHandler : GetAllWithCountHandler<Correspondence, CompletedItemVm, GetCompletedQuery>, IRequestHandler<GetCompletedQuery, Response<PagedResult<CompletedItemVm>>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IPermissionValidationService _permissionValidationService;

        public GetCompletedHandler(
            IBaseRepository<Correspondence> repository,
            ICurrentUserService currentUserService,
            IPermissionValidationService permissionValidationService) : base(repository)
        {
            _currentUserService = currentUserService;
            _permissionValidationService = permissionValidationService;
        }

        public override Expression<Func<Correspondence, CompletedItemVm>> Selector => x => new CompletedItemVm
        {
            CorrespondenceId = x.Id,
            Subject = x.Subject,
            PriorityLevel = x.PriorityLevel == 0 ? PriorityLevelEnum.Normal : x.PriorityLevel,
            PriorityLevelName = x.PriorityLevel.GetDisplayName(),
            SecrecyLevel = x.SecrecyLevel == 0 ? SecrecyLevelEnum.None : x.SecrecyLevel,
            SecrecyLevelName = x.SecrecyLevel.GetDisplayName(),
            CorrespondenceType = x.CorrespondenceType == 0 ? CorrespondenceTypeEnum.Draft : x.CorrespondenceType,
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

        public async Task<Response<PagedResult<CompletedItemVm>>> Handle(GetCompletedQuery request, CancellationToken cancellationToken)
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

            // Apply filtering
            query = query.ApplyFilter(request, _currentUserService.UserId);

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
                return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<CompletedItemVm>>(null!);

            // Set StatusName for each item (if applicable)
            result.ToList().ForEach(x =>
            {
                // Note: CompletedItemVm doesn't have Status property, so this might not be needed
                // But keeping it for consistency with base handler pattern
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

            var pagedResult = new PagedResult<CompletedItemVm>
            {
                Items = result,
                TotalCount = count
            };

            return SuccessMessage.Get.ToSuccessMessage(pagedResult);
        }
    }
}
