namespace BDFM.Application.Features.Security.UserPermissions.Commands.CreateUserPermissions
{
    internal class CreateUserPermissionsValidator : AbstractValidator<CreateUserPermissionsCommand>
    {
        public CreateUserPermissionsValidator()
        {
            RuleFor(x => x.UserId).NotEmpty().WithMessage("User ID is required");
            RuleFor(x => x.PermissionIds).NotEmpty().WithMessage("Permission IDs are required");
        }

    }
}
