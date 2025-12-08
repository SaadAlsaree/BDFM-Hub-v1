namespace BDFM.Application.Features.Tags.Commands.SoftDeleteTag;

public class SoftDeleteTagCommandValidator : AbstractValidator<SoftDeleteTagCommand>
{
    public SoftDeleteTagCommandValidator()
    {
        RuleFor(p => p.Id)
            .NotEmpty().WithMessage("{PropertyName} is required.");
    }
}

