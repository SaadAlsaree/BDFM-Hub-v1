namespace BDFM.Application.Features.Tags.Commands.UpdateTag;

public class UpdateTagCommandValidator : AbstractValidator<UpdateTagCommand>
{
    public UpdateTagCommandValidator()
    {
        RuleFor(p => p.Id)
            .NotEmpty().WithMessage("{PropertyName} is required.");

        RuleFor(p => p.CorrespondenceId)
            .NotEmpty().WithMessage("{PropertyName} is required.");

        RuleFor(p => p.Name)
           
            .MaximumLength(255).WithMessage("{PropertyName} must not exceed 255 characters.");

        RuleFor(p => p.Category)
            .IsInEnum().WithMessage("{PropertyName} is invalid.");

        RuleFor(p => p.ToPrimaryRecipientId)
            .NotEmpty().WithMessage("{PropertyName} is required.");

        RuleFor(p => p.ToPrimaryRecipientType)
            .IsInEnum().WithMessage("{PropertyName} is invalid.");
    }
}

