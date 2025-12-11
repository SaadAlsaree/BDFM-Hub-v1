namespace BDFM.Application.Features.Tags.Commands.CreateTag;

public class CreateTagCommandValidator : AbstractValidator<CreateTagCommand>
{
    public CreateTagCommandValidator()
    {
        RuleFor(p => p.CorrespondenceId)
            .NotEmpty().WithMessage("{PropertyName} is required.");

        RuleFor(p => p.Name)

            .MaximumLength(255).WithMessage("{PropertyName} must not exceed 255 characters.");


    }
}
