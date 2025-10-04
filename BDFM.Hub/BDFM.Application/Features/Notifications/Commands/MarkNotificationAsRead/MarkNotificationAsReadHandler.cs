using BDFM.Application.Contracts.Identity;
using BDFM.Application.Contracts.SignalR;
using BDFM.Domain.Entities.Supporting;
using BDFM.Domain.Common;

namespace BDFM.Application.Features.Notifications.Commands.MarkNotificationAsRead
{
    public class MarkNotificationAsReadHandler : IRequestHandler<MarkNotificationAsReadCommand, Response<bool>>
    {
        private readonly INotificationService _notificationService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IBaseRepository<Notification> _notificationRepository;

        public MarkNotificationAsReadHandler(
            INotificationService notificationService,
            ICurrentUserService currentUserService,
            IBaseRepository<Notification> notificationRepository)
        {
            _notificationService = notificationService;
            _currentUserService = currentUserService;
            _notificationRepository = notificationRepository;
        }

        public async Task<Response<bool>> Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
        {
            // Verify the notification belongs to the current user
            var notification = await _notificationRepository.Find(
                n => n.Id == request.NotificationId && n.UserId == _currentUserService.UserId,
                cancellationToken: cancellationToken);

            if (notification == null)
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage<bool>(false);
            }

            if (notification.IsRead)
            {
                return Response<bool>.Success(true, new MessageResponse { Code = "AlreadyRead", Message = "Notification is already marked as read" });
            }

            await _notificationService.MarkNotificationAsReadAsync(request.NotificationId, cancellationToken);

            return SuccessMessage.Update.ToSuccessMessage(true);
        }
    }
}
