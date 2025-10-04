namespace BDFM.Application.Features.Users.Commands.UpdateUser;

public class UpdateUserCommandValidator : AbstractValidator<UpdateUserCommand>
{
    public UpdateUserCommandValidator()
    {
        RuleFor(p => p.Id)
            .NotEmpty().WithMessage("معرف المستخدم مطلوب");

        RuleFor(p => p.Username)
            .NotEmpty().WithMessage("اسم المستخدم مطلوب")
            .MaximumLength(255).WithMessage("اسم المستخدم يجب أن لا يتجاوز 255 حرف");

        RuleFor(p => p.UserLogin)
            .NotEmpty().WithMessage("معرف تسجيل الدخول مطلوب")
            .MaximumLength(100).WithMessage("معرف تسجيل الدخول يجب أن لا يتجاوز 100 حرف");

        RuleFor(p => p.FullName)
            .NotEmpty().WithMessage("الاسم الكامل مطلوب")
            .MaximumLength(255).WithMessage("الاسم الكامل يجب أن لا يتجاوز 255 حرف");

        RuleFor(p => p.Email)
            .EmailAddress().WithMessage("البريد الإلكتروني غير صحيح")
            .MaximumLength(255).WithMessage("البريد الإلكتروني يجب أن لا يتجاوز 255 حرف")
            .When(p => !string.IsNullOrEmpty(p.Email));

        RuleFor(p => p.PositionTitle)
            .MaximumLength(255).WithMessage("المسمى الوظيفي يجب أن لا يتجاوز 255 حرف")
            .When(p => !string.IsNullOrEmpty(p.PositionTitle));

        RuleFor(p => p.RfidTagId)
            .MaximumLength(100).WithMessage("معرف بطاقة RFID يجب أن لا يتجاوز 100 حرف")
            .When(p => !string.IsNullOrEmpty(p.RfidTagId));
    }
}
