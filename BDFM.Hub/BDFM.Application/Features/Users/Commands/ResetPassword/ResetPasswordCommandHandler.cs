using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Users.Commands.ResetPassword;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Response<bool>>
{
    private readonly IBaseRepository<User> _userRepository;

    public ResetPasswordCommandHandler(IBaseRepository<User> userRepository)
    {
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
    }

    public async Task<Response<bool>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        // Find the user
        var user = await _userRepository.Find(
            u => u.Id == request.UserId,
            cancellationToken: cancellationToken);

        if (user == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage(false);

        // Update password using BCrypt for consistency with AuthenticationService
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.LastUpdateAt = DateTime.UtcNow;

        var result = _userRepository.Update(user);

        return result
            ? SuccessMessage.Update.ToSuccessMessage(true)
            : ErrorsMessage.FailOnUpdate.ToErrorMessage(false);
    }
}
