using BDFM.Application.Features.Utility.BaseUtility.Command.Update;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Users.Commands.UpdateUser;

public class UpdateUserCommandHandler : UpdateHandler<User, UpdateUserCommand>, IRequestHandler<UpdateUserCommand, Response<bool>>
{
    public UpdateUserCommandHandler(IBaseRepository<User> repository)
        : base(repository)
    {
    }

    public override Expression<Func<User, bool>> EntityPredicate(UpdateUserCommand request)
    {
        return u => u.Id == request.Id;
    }

    public async Task<Response<bool>> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        // Check if user exists
        var user = await _repository.Find(
            EntityPredicate(request),
            cancellationToken: cancellationToken);

        if (user == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage(false);

        // Check if username or userlogin already exists for another user
        var existingUser = await _repository.Find(
            u => (u.Username == request.Username || u.UserLogin == request.UserLogin ||
                 (!string.IsNullOrEmpty(request.Email) && u.Email == request.Email) ||
                 (!string.IsNullOrEmpty(request.RfidTagId) && u.RfidTagId == request.RfidTagId)) &&
                 u.Id != request.Id,
            cancellationToken: cancellationToken);

        if (existingUser != null)
            return ErrorsMessage.ExistOnCreate.ToErrorMessage(false);

        // Use the base handler to update
        return await HandleBase(request, cancellationToken);
    }
}
