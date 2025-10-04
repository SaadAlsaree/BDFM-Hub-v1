using BDFM.Application.Contracts.Identity;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.UserCorrespondenceInteractionFeatures.ReceiveNotifications;

public class ReceiveNotificationsHandler : IRequestHandler<ReceiveNotificationsCommand, Response<bool>>
{
    private readonly IBaseRepository<UserCorrespondenceInteraction> _userCorrespondenceInteraction;
    private readonly ICurrentUserService _currentUserService;

    public ReceiveNotificationsHandler(IBaseRepository<UserCorrespondenceInteraction> userCorrespondenceInteraction, ICurrentUserService currentUserService)
    {
        _userCorrespondenceInteraction = userCorrespondenceInteraction;
        _currentUserService = currentUserService;
    }


    public async Task<Response<bool>> Handle(ReceiveNotificationsCommand request, CancellationToken cancellationToken)
    {
        // 1- check if the UserCorrespondenceInteraction exists if not exist create it (CorrespondenceId, UserId)
        // 2- check if the UserCorrespondenceInteraction receives notifications
        // 3- return the result

        var userCorrespondenceInteraction = await _userCorrespondenceInteraction.Find(x => x.CorrespondenceId == request.CorrespondenceId && x.UserId == _currentUserService.UserId, cancellationToken: cancellationToken);
        if (userCorrespondenceInteraction == null)
        {
            userCorrespondenceInteraction = new UserCorrespondenceInteraction
            {
                CorrespondenceId = request.CorrespondenceId,
                UserId = _currentUserService.UserId,
                ReceiveNotifications = request.ReceiveNotifications
            };
            await _userCorrespondenceInteraction.Create(userCorrespondenceInteraction, cancellationToken);
        }
        else
        {
            userCorrespondenceInteraction.ReceiveNotifications = request.ReceiveNotifications;
            _userCorrespondenceInteraction.Update(userCorrespondenceInteraction);
        }

        return SuccessMessage.Get.ToSuccessMessage(userCorrespondenceInteraction.ReceiveNotifications);
    }
}
