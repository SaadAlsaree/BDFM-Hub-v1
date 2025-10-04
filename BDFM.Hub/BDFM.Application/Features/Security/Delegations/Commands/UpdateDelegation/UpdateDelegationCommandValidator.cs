namespace BDFM.Application.Features.Security.Delegations.Commands.UpdateDelegation;

public class UpdateDelegationCommandValidator : AbstractValidator<UpdateDelegationCommand>
{
    public UpdateDelegationCommandValidator()
    {
        RuleFor(d => d.Id)
            .NotEmpty().WithMessage("Delegation ID is required.");

        RuleFor(d => d.DelegatorUserId)
            .NotEmpty().WithMessage("Delegator user ID is required.");

        RuleFor(d => d.DelegateeUserId)
            .NotEmpty().WithMessage("Delegatee user ID is required.")
            .NotEqual(d => d.DelegatorUserId).WithMessage("Delegator and delegatee users cannot be the same.");

        RuleFor(d => d)
            .Must(d => d.PermissionId.HasValue || d.RoleId.HasValue)
            .WithMessage("Either a permission or a role must be specified for delegation.");

        RuleFor(d => d.StartDate)
            .NotEmpty().WithMessage("Start date is required.")
            .LessThan(d => d.EndDate).WithMessage("Start date must be before end date.");

        RuleFor(d => d.EndDate)
            .NotEmpty().WithMessage("End date is required.")
            .GreaterThan(d => d.StartDate).WithMessage("End date must be after start date.");
    }
}
