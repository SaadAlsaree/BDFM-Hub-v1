namespace BDFM.Application.Features.Correspondences.Commands.CreatePublicMail;

public class CreatePublicMailValidator : AbstractValidator<CreatePublicMailCommand>
{
    public CreatePublicMailValidator()
    {


        RuleFor(x => x.MailDate)
            .NotEmpty().WithMessage("Mail date is required");

        RuleFor(x => x.Subject)
            .NotEmpty().WithMessage("Subject is required")
            .MaximumLength(255).WithMessage("Subject must not exceed 255 characters");

        RuleFor(x => x.SecrecyLevel)
            .IsInEnum().WithMessage("Invalid secrecy level");

        RuleFor(x => x.PriorityLevel)
            .IsInEnum().WithMessage("Invalid priority level");

        RuleFor(x => x.PersonalityLevel)
            .IsInEnum().WithMessage("Invalid personality level");

        RuleFor(x => x.CreatedByUserId)
            .NotEmpty().WithMessage("Created by user ID is required")
            .Must(x => x != Guid.Empty).WithMessage("Created by user ID cannot be empty");

        // Public mail specific validations
        RuleFor(x => x.ExternalReferenceNumber)
            .MaximumLength(100).WithMessage("External reference number must not exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.ExternalReferenceNumber));

        RuleFor(x => x.ExternalReferenceDate)
            .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("External reference date cannot be in the future")
            .When(x => x.ExternalReferenceDate.HasValue);
    }
}
