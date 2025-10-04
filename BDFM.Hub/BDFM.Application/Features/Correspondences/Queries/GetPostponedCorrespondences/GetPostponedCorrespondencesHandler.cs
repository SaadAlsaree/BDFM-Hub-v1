using BDFM.Application.Contracts.Identity;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetPostponedCorrespondences
{
    public class GetPostponedCorrespondencesHandler : GetAllWithCountHandler<Correspondence, GetPostponedCorrespondencesVm, GetPostponedCorrespondencesQuery>, IRequestHandler<GetPostponedCorrespondencesQuery, Response<PagedResult<GetPostponedCorrespondencesVm>>>
    {
        ICurrentUserService _currentUserService;
        public GetPostponedCorrespondencesHandler(IBaseRepository<Correspondence> repository, ICurrentUserService currentUserService) : base(repository)
        {
            _currentUserService = currentUserService;
        }

        public override Expression<Func<Correspondence, GetPostponedCorrespondencesVm>> Selector => x => new GetPostponedCorrespondencesVm
        {
            CorrespondenceId = x.Id,
            Subject = x.Subject,
            CorrespondenceStatus = x.Status == 0 ? CorrespondenceStatusEnum.Registered : x.Status,
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
            var query = _repository.Query();

            // Apply filtering with current user context for postponed correspondences
            query = query.ApplyFilterPostponed(_currentUserService.UserId);

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
