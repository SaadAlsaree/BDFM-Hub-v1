namespace BDFM.Application.Features.Security.UnitPermissions.Commands.AssignPermissionsToUnit;

public class AssignPermissionsToUnitCommandValidator : AbstractValidator<AssignPermissionsToUnitCommand>
{
    public AssignPermissionsToUnitCommandValidator()
    {
        RuleFor(x => x.UnitId)
            .NotEmpty().WithMessage("Unit ID is required.");

        RuleFor(x => x.PermissionIds)
            .NotEmpty().WithMessage("At least one permission ID is required.")
            .Must(list => list != null && list.Count > 0).WithMessage("At least one permission ID is required.");
    }
}
