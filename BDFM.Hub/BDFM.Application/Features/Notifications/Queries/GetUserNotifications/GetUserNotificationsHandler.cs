using BDFM.Application.Contracts.Identity;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Supporting;


namespace BDFM.Application.Features.Notifications.Queries.GetUserNotifications
{
    public class GetUserNotificationsHandler :
        GetAllWithCountHandler<Notification, UserNotificationVm, GetUserNotificationsQuery>,
        IRequestHandler<GetUserNotificationsQuery, Response<PagedResult<UserNotificationVm>>>
    {
        private readonly ICurrentUserService _currentUserService;

        public GetUserNotificationsHandler(
            IBaseRepository<Notification> repository,
            ICurrentUserService currentUserService) : base(repository)
        {
            _currentUserService = currentUserService;
        }

        public override Expression<Func<Notification, UserNotificationVm>> Selector => n => new UserNotificationVm
        {
            Id = n.Id,
            Message = n.Message,
            NotificationType = n.NotificationType,
            NotificationTypeName = n.NotificationType.GetDisplayName(),
            IsRead = n.IsRead,
            CreateAt = n.CreateAt,
            LinkToCorrespondenceId = n.LinkToCorrespondenceId,
            LinkToWorkflowStepId = n.LinkToWorkflowStepId,
            CorrespondenceSubject = n.LinkToCorrespondence != null ? n.LinkToCorrespondence.Subject : null,
            CorrespondenceMailNum = n.LinkToCorrespondence != null ? n.LinkToCorrespondence.MailNum : null
        };

        public override Func<IQueryable<Notification>, IOrderedQueryable<Notification>> OrderBy =>
            query => query.OrderByDescending(n => n.CreateAt);

        public async Task<Response<PagedResult<UserNotificationVm>>> Handle(GetUserNotificationsQuery request, CancellationToken cancellationToken)
        {
            // Override the base query to apply user-specific filtering and include navigation properties
            var query = _repository.Query()
                .Include(n => n.LinkToCorrespondence)
                .ApplyFilter(request, _currentUserService.UserId);

            var orderedQuery = OrderBy(query);

            var result = await orderedQuery
                .ApplyPagination(request)
                .Select(Selector)
                .ToListAsync(cancellationToken);

            var count = await query.CountAsync(cancellationToken);

            if (!result.Any())
                return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<UserNotificationVm>>(null!);

            var pagedResult = new PagedResult<UserNotificationVm>
            {
                Items = result,
                TotalCount = count
            };

            return SuccessMessage.Get.ToSuccessMessage(pagedResult);
        }
    }
}
