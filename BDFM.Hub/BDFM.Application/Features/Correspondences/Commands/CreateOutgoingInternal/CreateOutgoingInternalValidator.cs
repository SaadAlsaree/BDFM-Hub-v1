namespace BDFM.Application.Features.Correspondences.Commands.CreateOutgoingInternal
{
    internal class CreateOutgoingInternalValidator : AbstractValidator<CreateOutgoingInternalCommand>
    {
        public CreateOutgoingInternalValidator()
        {

            RuleFor(x => x.MailDate)
                .NotEmpty().WithMessage("Book date is required.");
            RuleFor(x => x.Subject)
                .NotEmpty().WithMessage("Subject is required.")
                .MaximumLength(200).WithMessage("Subject cannot exceed 200 characters.");


            // LinkMailId is optional - only validate if it's not empty
            RuleFor(x => x.LinkMailId)
                .NotEmpty().WithMessage("Link Book ID cannot be empty when provided.")
                .When(x => x.LinkMailId != Guid.Empty);
            RuleFor(x => x.BodyText)
                .MaximumLength(5000).WithMessage("Body text cannot exceed 5000 characters.");
            RuleFor(x => x.SecrecyLevel)
                .IsInEnum().WithMessage("Invalid secrecy level.");
            RuleFor(x => x.PriorityLevel)
                .IsInEnum().WithMessage("Invalid priority level.");
            RuleFor(x => x.PersonalityLevel)
                .IsInEnum().WithMessage("Invalid personality level.");
            RuleFor(x => x.CreatedByUserId)
                .NotEmpty().WithMessage("Created by user ID is required.");
        }
    }
}
