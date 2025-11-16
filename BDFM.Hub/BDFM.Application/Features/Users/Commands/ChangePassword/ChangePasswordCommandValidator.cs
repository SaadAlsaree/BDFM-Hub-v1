namespace BDFM.Application.Features.Users.Commands.ChangePassword;

public class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(p => p.UserId)
            .NotEmpty().WithMessage("User ID is required");

        RuleFor(p => p.CurrentPassword)
            .NotEmpty().WithMessage("Current password is required");

        RuleFor(p => p.NewPassword)
            .NotEmpty().WithMessage("New password is required")
            .MinimumLength(6).WithMessage("New password must be at least 6 characters long")
            .MaximumLength(255).WithMessage("New password must not exceed 255 characters")
            .NotEqual(p => p.CurrentPassword).WithMessage("New password must be different from current password");

        RuleFor(p => p.ConfirmPassword)
            .NotEmpty().WithMessage("Confirm password is required")
            .Equal(p => p.NewPassword).WithMessage("Confirm password and new password do not match");
    }
}
