namespace BDFM.Application.Features.Correspondences.Commands.CreateMailDraft
{
    public class CreateMailDraftValidator : AbstractValidator<CreateMailDraftCommand>
    {
        public CreateMailDraftValidator()
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

        }
    }
}
