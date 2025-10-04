namespace BDFM.Application.Features.Notifications.Commands.MarkNotificationAsRead
{
    public class MarkNotificationAsReadCommand : IRequest<Response<bool>>
    {
        public Guid NotificationId { get; set; }
    }
}
