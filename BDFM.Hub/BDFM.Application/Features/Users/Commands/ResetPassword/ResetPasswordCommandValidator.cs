namespace BDFM.Application.Features.Users.Commands.ResetPassword;

public class ResetPasswordCommandValidator : AbstractValidator<ResetPasswordCommand>
{
    public ResetPasswordCommandValidator()
    {
        RuleFor(p => p.UserId)
            .NotEmpty().WithMessage("User ID is required");

        RuleFor(p => p.NewPassword)
            .NotEmpty().WithMessage("New password required")
            .MinimumLength(8).WithMessage("New password must be at least 8 characters long")
            .MaximumLength(255).WithMessage("New password must not exceed 255 characters");
    }
}
