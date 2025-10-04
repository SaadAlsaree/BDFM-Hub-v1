using BDFM.Application.Contracts.Identity;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.UserCorrespondenceInteractionFeatures.IsInTrash;

public class IsInTrashHandler : IRequestHandler<IsInTrashCommand, Response<bool>>
{
    private readonly IBaseRepository<UserCorrespondenceInteraction> _userCorrespondenceInteraction;
    private readonly ICurrentUserService _currentUserService;

    public IsInTrashHandler(IBaseRepository<UserCorrespondenceInteraction> userCorrespondenceInteraction, ICurrentUserService currentUserService)
    {
        _userCorrespondenceInteraction = userCorrespondenceInteraction;
        _currentUserService = currentUserService;
    }


    public async Task<Response<bool>> Handle(IsInTrashCommand request, CancellationToken cancellationToken)
    {
        // 1- check if the UserCorrespondenceInteraction exists if not exist create it (CorrespondenceId, UserId)
        // 2- check if the UserCorrespondenceInteraction is in trash
        // 3- return the result

        var userCorrespondenceInteraction = await _userCorrespondenceInteraction.Find(x => x.CorrespondenceId == request.CorrespondenceId && x.UserId == _currentUserService.UserId, cancellationToken: cancellationToken);
        if (userCorrespondenceInteraction == null)
        {
            userCorrespondenceInteraction = new UserCorrespondenceInteraction
            {
                CorrespondenceId = request.CorrespondenceId,
                UserId = _currentUserService.UserId,
                IsInTrash = request.IsInTrash
            };
            await _userCorrespondenceInteraction.Create(userCorrespondenceInteraction, cancellationToken);
        }
        else
        {
            userCorrespondenceInteraction.IsInTrash = request.IsInTrash;
            _userCorrespondenceInteraction.Update(userCorrespondenceInteraction);
        }

        return SuccessMessage.Get.ToSuccessMessage(userCorrespondenceInteraction.IsInTrash);
    }
}

