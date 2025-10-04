using BDFM.Application.Contracts.Identity;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetUserDrafts
{
    public class GetUserDraftsHandler : GetAllWithCountHandler<Correspondence, DraftItemVm, GetUserDraftsQuery>, IRequestHandler<GetUserDraftsQuery, Response<PagedResult<DraftItemVm>>>
    {
        private readonly ICurrentUserService _currentUserService;
        public GetUserDraftsHandler(IBaseRepository<Correspondence> repository, ICurrentUserService currentUserService) : base(repository)
        {
            _currentUserService = currentUserService;
        }

        public override Expression<Func<Correspondence, DraftItemVm>> Selector => x => new DraftItemVm
        {
            CorrespondenceId = x.Id,
            Subject = x.Subject,
            PriorityLevel = x.PriorityLevel == 0 ? PriorityLevelEnum.Normal : x.PriorityLevel,
            PriorityLevelName = x.PriorityLevel.GetDisplayName(),
            SecrecyLevel = x.SecrecyLevel == 0 ? SecrecyLevelEnum.None : x.SecrecyLevel,
            SecrecyLevelName = x.SecrecyLevel.GetDisplayName(),
            CorrespondenceType = x.CorrespondenceType == 0 ? CorrespondenceTypeEnum.Draft : x.CorrespondenceType,
            CorrespondenceTypeName = x.CorrespondenceType.GetDisplayName(),
            CorrespondenceStatus = x.Status == 0 ? CorrespondenceStatusEnum.Registered : x.Status,
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

        public async Task<Response<PagedResult<DraftItemVm>>> Handle(GetUserDraftsQuery request, CancellationToken cancellationToken)
        {
            var query = _repository.Query();

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
                return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<DraftItemVm>>(null!);

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

            var pagedResult = new PagedResult<DraftItemVm>
            {
                Items = result,
                TotalCount = count
            };

            return SuccessMessage.Get.ToSuccessMessage(pagedResult);
        }
    }
}
