namespace BDFM.Application.Features.OrganizationalUnits.Commands.UpdateOrganizationalUnit;

public class UpdateOrganizationalUnitCommandValidator : AbstractValidator<UpdateOrganizationalUnitCommand>
{
    public UpdateOrganizationalUnitCommandValidator()
    {
        RuleFor(p => p.Id)
            .NotEmpty().WithMessage("{PropertyName} is required.");

        RuleFor(p => p.UnitName)
            .NotEmpty().WithMessage("{PropertyName} is required.")
            .MaximumLength(100).WithMessage("{PropertyName} must not exceed 100 characters.");

        RuleFor(p => p.UnitCode)
            .NotEmpty().WithMessage("{PropertyName} is required.")
            .MaximumLength(50).WithMessage("{PropertyName} must not exceed 50 characters.");

        RuleFor(p => p.UnitDescription)
            .MaximumLength(500).WithMessage("{PropertyName} must not exceed 500 characters.")
            .When(p => !string.IsNullOrEmpty(p.UnitDescription));

        RuleFor(p => p.Email)
            .EmailAddress().WithMessage("{PropertyName} must be a valid email address.")
            .When(p => !string.IsNullOrEmpty(p.Email));

        RuleFor(p => p.PhoneNumber)
            .MaximumLength(20).WithMessage("{PropertyName} must not exceed 20 characters.")
            .When(p => !string.IsNullOrEmpty(p.PhoneNumber));

        RuleFor(p => p.FaxNumber)
            .MaximumLength(20).WithMessage("{PropertyName} must not exceed 20 characters.")
            .When(p => !string.IsNullOrEmpty(p.FaxNumber));

        RuleFor(p => p.PostalCode)
            .MaximumLength(20).WithMessage("{PropertyName} must not exceed 20 characters.")
            .When(p => !string.IsNullOrEmpty(p.PostalCode));
    }
}
