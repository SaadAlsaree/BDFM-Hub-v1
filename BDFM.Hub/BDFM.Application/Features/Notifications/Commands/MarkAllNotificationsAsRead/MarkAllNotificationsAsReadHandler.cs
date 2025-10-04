using BDFM.Application.Contracts.Identity;
using BDFM.Application.Contracts.SignalR;

namespace BDFM.Application.Features.Notifications.Commands.MarkAllNotificationsAsRead
{
    public class MarkAllNotificationsAsReadHandler : IRequestHandler<MarkAllNotificationsAsReadCommand, Response<bool>>
    {
        private readonly INotificationService _notificationService;
        private readonly ICurrentUserService _currentUserService;

        public MarkAllNotificationsAsReadHandler(
            INotificationService notificationService,
            ICurrentUserService currentUserService)
        {
            _notificationService = notificationService;
            _currentUserService = currentUserService;
        }

        public async Task<Response<bool>> Handle(MarkAllNotificationsAsReadCommand request, CancellationToken cancellationToken)
        {
            await _notificationService.MarkAllUserNotificationsAsReadAsync(_currentUserService.UserId, cancellationToken);

            return SuccessMessage.Update.ToSuccessMessage(true);
        }
    }
}
