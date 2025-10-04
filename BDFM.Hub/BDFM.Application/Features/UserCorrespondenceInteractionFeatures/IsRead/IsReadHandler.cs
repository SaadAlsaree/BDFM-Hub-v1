using BDFM.Application.Contracts.Identity;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.UserCorrespondenceInteractionFeatures.IsRead;

public class IsReadHandler : IRequestHandler<IsReadCommand, Response<bool>>
{
    private readonly IBaseRepository<UserCorrespondenceInteraction> _userCorrespondenceInteraction;
    private readonly ICurrentUserService _currentUserService;

    public IsReadHandler(IBaseRepository<UserCorrespondenceInteraction> userCorrespondenceInteraction, ICurrentUserService currentUserService)
    {
        _userCorrespondenceInteraction = userCorrespondenceInteraction;
        _currentUserService = currentUserService;
    }


    public async Task<Response<bool>> Handle(IsReadCommand request, CancellationToken cancellationToken)
    {
        // 1- check if the UserCorrespondenceInteraction exists if not exist create it (CorrespondenceId, UserId)
        // 2- check if the UserCorrespondenceInteraction is read
        // 3- return the result

        var userCorrespondenceInteraction = await _userCorrespondenceInteraction.Find(x => x.CorrespondenceId == request.CorrespondenceId && x.UserId == _currentUserService.UserId, cancellationToken: cancellationToken);
        if (userCorrespondenceInteraction == null)
        {
            userCorrespondenceInteraction = new UserCorrespondenceInteraction
            {
                CorrespondenceId = request.CorrespondenceId,
                UserId = _currentUserService.UserId,
                IsRead = request.IsRead
            };
            await _userCorrespondenceInteraction.Create(userCorrespondenceInteraction, cancellationToken);
        }
        else
        {
            userCorrespondenceInteraction.IsRead = request.IsRead;
            _userCorrespondenceInteraction.Update(userCorrespondenceInteraction);
        }

        return SuccessMessage.Get.ToSuccessMessage(userCorrespondenceInteraction.IsRead);
    }
}
