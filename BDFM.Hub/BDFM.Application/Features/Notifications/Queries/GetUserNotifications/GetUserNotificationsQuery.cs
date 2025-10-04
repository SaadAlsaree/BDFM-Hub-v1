using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Supporting;


namespace BDFM.Application.Features.Notifications.Queries.GetUserNotifications
{
    public class GetUserNotificationsQuery : PaginationQuery, IRequest<Response<PagedResult<UserNotificationVm>>>
    {
        public bool? IsRead { get; set; }
        public NotificationTypeEnum? NotificationType { get; set; }
    }

    public static class GetUserNotificationsQueryExtensions
    {
        public static IQueryable<Notification> ApplyFilter(this IQueryable<Notification> query, GetUserNotificationsQuery request, Guid currentUserId)
        {
            // Apply user-specific filter
            query = query.Where(n => n.UserId == currentUserId);

            // Apply IsRead filter if specified
            if (request.IsRead.HasValue)
            {
                query = query.Where(n => n.IsRead == request.IsRead.Value);
            }

            // Apply NotificationType filter if specified
            if (request.NotificationType.HasValue)
            {
                query = query.Where(n => n.NotificationType == request.NotificationType.Value);
            }

            return query;
        }
    }
}
