namespace BDFM.Application.Features.Users.Commands.ChangePassword;

public class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(p => p.UserId)
            .NotEmpty().WithMessage("معرف المستخدم مطلوب");

        RuleFor(p => p.CurrentPassword)
            .NotEmpty().WithMessage("كلمة المرور الحالية مطلوبة");

        RuleFor(p => p.NewPassword)
            .NotEmpty().WithMessage("كلمة المرور الجديدة مطلوبة")
            .MinimumLength(8).WithMessage("كلمة المرور الجديدة يجب أن تحتوي على الأقل 8 أحرف")
            .MaximumLength(255).WithMessage("كلمة المرور الجديدة يجب أن لا تتجاوز 255 حرف")
            .NotEqual(p => p.CurrentPassword).WithMessage("كلمة المرور الجديدة يجب أن تكون مختلفة عن كلمة المرور الحالية");

        RuleFor(p => p.ConfirmPassword)
            .NotEmpty().WithMessage("تأكيد كلمة المرور مطلوب")
            .Equal(p => p.NewPassword).WithMessage("كلمة المرور وتأكيدها غير متطابقين");
    }
}
