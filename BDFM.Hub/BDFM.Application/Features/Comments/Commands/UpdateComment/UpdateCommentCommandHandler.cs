using BDFM.Application.Contracts.Identity;
using BDFM.Application.Features.Utility.BaseUtility.Command.Update;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.Comments.Commands.UpdateComment;

public class UpdateCommentCommandHandler :
    UpdateHandler<CorrespondenceComment, UpdateCommentCommand>,
    IRequestHandler<UpdateCommentCommand, Response<bool>>
{
    private readonly ICurrentUserService _currentUserService;
    public UpdateCommentCommandHandler(IBaseRepository<CorrespondenceComment> repository, ICurrentUserService currentUserService) : base(repository)
    {
        _currentUserService = currentUserService;
    }

    public override Expression<Func<CorrespondenceComment, bool>> EntityPredicate(UpdateCommentCommand request)
    {
        var currentUserId = _currentUserService.UserId;
        return cc => cc.Id == request.Id && cc.UserId == currentUserId;
    }

    public async Task<Response<bool>> Handle(UpdateCommentCommand request, CancellationToken cancellationToken)
    {
        return await HandleBase(request, cancellationToken);
    }
}
