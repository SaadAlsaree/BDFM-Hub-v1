

namespace BDFM.Application.Features.Security.UserRoles.Commands.CreateUserRoles
{
    public class CreateUserRolesValidator : AbstractValidator<CreateUserRolesCommand>
    {
        public CreateUserRolesValidator()
        {
            RuleFor(x => x.UserId).NotEmpty().WithMessage("User ID is required");
            RuleFor(x => x.RoleId).NotEmpty().WithMessage("Role ID is required");
        }

    }
}
