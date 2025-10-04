namespace BDFM.Application.Features.Users.Commands.UpdateUserRoles;

public class UpdateUserRolesCommandValidator : AbstractValidator<UpdateUserRolesCommand>
{
    public UpdateUserRolesCommandValidator()
    {
        RuleFor(p => p.UserId)
            .NotEmpty().WithMessage("معرف المستخدم مطلوب");

        RuleFor(p => p.RoleIds)
            .NotEmpty().WithMessage("الأدوار مطلوبة")
            .Must(roles => roles.Count > 0).WithMessage("يجب تحديد دور واحد على الأقل");
    }
}
