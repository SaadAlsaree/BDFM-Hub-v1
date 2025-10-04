namespace BDFM.Application.Features.Tags.Commands.CreateTag
{
    public class CreateTagCommandValidator : AbstractValidator<CreateTagCommand>
    {
        public CreateTagCommandValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Tag name is required")
                .MaximumLength(100).WithMessage("Tag name cannot exceed 100 characters")
                .Matches(@"^[a-zA-Z0-9\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF-_]+$")
                .WithMessage("Tag name contains invalid characters");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters")
                .When(x => !string.IsNullOrEmpty(x.Description));

            RuleFor(x => x.Color)
                .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
                .WithMessage("Color must be a valid hex color code (e.g., #FF5733)")
                .When(x => !string.IsNullOrEmpty(x.Color));

            RuleFor(x => x.Category)
                .IsInEnum().WithMessage("Invalid tag category");


        }
    }
}
