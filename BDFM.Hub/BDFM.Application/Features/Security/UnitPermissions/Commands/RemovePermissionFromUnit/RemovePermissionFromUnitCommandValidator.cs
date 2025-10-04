namespace BDFM.Application.Features.Security.UnitPermissions.Commands.RemovePermissionFromUnit;

public class RemovePermissionFromUnitCommandValidator : AbstractValidator<RemovePermissionFromUnitCommand>
{
    public RemovePermissionFromUnitCommandValidator()
    {
        RuleFor(x => x.UnitId)
            .NotEmpty().WithMessage("Unit ID is required.");

        RuleFor(x => x.PermissionId)
            .NotEmpty().WithMessage("Permission ID is required.");
    }
}
