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

        // Check if username already exists for another user
        var existingUsername = await _repository.Find(
            u => u.Username == request.Username && u.Id != request.Id,
            cancellationToken: cancellationToken);

        if (existingUsername != null)
            return ErrorsMessage.ExistOnCreate.ToErrorMessage(false);

        // Check if userlogin already exists for another user
        var existingUserLogin = await _repository.Find(
            u => u.UserLogin == request.UserLogin && u.Id != request.Id,
            cancellationToken: cancellationToken);

        if (existingUserLogin != null)
            return ErrorsMessage.ExistOnCreate.ToErrorMessage(false);

        // Check if email already exists for another user (only if email is provided)
        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var existingEmail = await _repository.Find(
                u => u.Email == request.Email && u.Id != request.Id,
                cancellationToken: cancellationToken);

            if (existingEmail != null)
                return ErrorsMessage.ExistOnCreate.ToErrorMessage(false);
        }



        // Use the base handler to update
        return await HandleBase(request, cancellationToken);
    }
}
