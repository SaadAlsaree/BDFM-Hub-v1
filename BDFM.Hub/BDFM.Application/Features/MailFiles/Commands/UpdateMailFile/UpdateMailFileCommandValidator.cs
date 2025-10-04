namespace BDFM.Application.Features.MailFiles.Commands.UpdateMailFile;

public class UpdateMailFileCommandValidator : AbstractValidator<UpdateMailFileCommand>
{
    public UpdateMailFileCommandValidator()
    {
        RuleFor(p => p.Id)
            .NotEmpty().WithMessage("{PropertyName} is required.");

      

        RuleFor(p => p.Name)
            .NotEmpty().WithMessage("{PropertyName} is required.")
            .NotNull()
            .MaximumLength(100).WithMessage("{PropertyName} must not exceed 100 characters.")
            .MinimumLength(3).WithMessage("{PropertyName} must be at least 3 characters.");

        RuleFor(p => p.Subject)
            .MaximumLength(500).WithMessage("{PropertyName} must not exceed 500 characters.");
    }
}
