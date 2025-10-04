namespace BDFM.Application.Features.UserCorrespondenceInteractionFeatures.ReceiveNotifications
{
    public class ReceiveNotificationsCommand : IRequest<Response<bool>>
    {
        public Guid CorrespondenceId { get; set; }
        public bool ReceiveNotifications { get; set; }
    }
}
