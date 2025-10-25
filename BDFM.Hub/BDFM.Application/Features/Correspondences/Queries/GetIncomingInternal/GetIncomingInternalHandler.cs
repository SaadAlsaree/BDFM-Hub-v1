using BDFM.Application.Contract.Identity;
using BDFM.Application.Contracts.Identity;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Application.Extensions;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetIncomingInternal
{
    internal class GetIncomingInternalHandler : GetAllWithCountHandler<Correspondence, IncomingInternalVm, GetIncomingInternalQuery>, IRequestHandler<GetIncomingInternalQuery, Response<PagedResult<IncomingInternalVm>>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IPermissionValidationService _permissionValidationService;

        public GetIncomingInternalHandler(
            IBaseRepository<Correspondence> repository,
            ICurrentUserService currentUserService,
            IPermissionValidationService permissionValidationService) : base(repository)
        {
            _currentUserService = currentUserService;
            _permissionValidationService = permissionValidationService;
        }

        public override Expression<Func<Correspondence, IncomingInternalVm>> Selector => x => new IncomingInternalVm
        {
            CorrespondenceId = x.Id,
            Subject = x.Subject,
            PriorityLevel = x.PriorityLevel == 0 ? PriorityLevelEnum.Normal : x.PriorityLevel,
            PriorityLevelName = x.PriorityLevel.GetDisplayName(),
            SecrecyLevel = x.SecrecyLevel == 0 ? SecrecyLevelEnum.None : x.SecrecyLevel,
            SecrecyLevelName = x.SecrecyLevel.GetDisplayName(),
            CorrespondenceType = x.CorrespondenceType == 0 ? CorrespondenceTypeEnum.IncomingInternal : x.CorrespondenceType,
            CorrespondenceTypeName = x.CorrespondenceType.GetDisplayName(),
            CorrespondenceStatus = x.Status == 0 ? CorrespondenceStatusEnum.PendingReferral : x.Status,
            CorrespondenceStatusName = x.Status.GetDisplayName(),
            WorkflowStepId = x.WorkflowSteps.Where(y => y.DueDate.HasValue).Select(y => y.Id).FirstOrDefault(),
            MailNum = x.MailNum,
            MailDate = x.MailDate,
            ExternalReferenceNumber = x.ExternalReferenceNumber!,
            ExternalReferenceDate = x.ExternalReferenceDate.HasValue ? x.ExternalReferenceDate.Value.ToDateTime(TimeOnly.MinValue) : DateTime.MinValue,
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

        public async Task<Response<PagedResult<IncomingInternalVm>>> Handle(GetIncomingInternalQuery request, CancellationToken cancellationToken)
        {
            // Get user info and access control parameters
            var userUnitId = _currentUserService.OrganizationalUnitId;
            var isSuAdminOrManager = _currentUserService.HasRole("SuAdmin") || _currentUserService.HasRole("Manager");
            var accessibleUnitIds = await _permissionValidationService.GetAccessibleUnitIdsAsync(cancellationToken);

            var query = _repository.Query();

            // Apply access control
            query = query.ApplyCorrespondenceAccessControl(
                _currentUserService.UserId,
                userUnitId,
                isSuAdminOrManager,
                accessibleUnitIds);

            // Filter for incoming internal correspondences only
            query = query.Where(c => c.CorrespondenceType == CorrespondenceTypeEnum.IncomingInternal);

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
                return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<IncomingInternalVm>>(null!);

            // Set StatusName for each item (if applicable)
            result.ToList().ForEach(x =>
            {
                // Note: InboxItemVm doesn't have Status property, so this might not be needed
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

            var pagedResult = new PagedResult<IncomingInternalVm>
            {
                Items = result,
                TotalCount = count
            };

            return SuccessMessage.Get.ToSuccessMessage(pagedResult);
        }
    }
}
