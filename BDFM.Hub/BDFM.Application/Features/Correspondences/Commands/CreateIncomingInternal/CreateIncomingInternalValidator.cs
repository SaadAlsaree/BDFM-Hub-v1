namespace BDFM.Application.Features.Correspondences.Commands.CreateIncomingInternal
{
    internal class CreateIncomingInternalValidator : AbstractValidator<CreateIncomingInternalCommand>
    {
        public CreateIncomingInternalValidator()
        {

            RuleFor(x => x.MailDate)
                .NotEmpty().WithMessage("Book date is required.");
            RuleFor(x => x.Subject)
                .NotEmpty().WithMessage("Subject is required.")
                .MaximumLength(200).WithMessage("Subject cannot exceed 200 characters.");

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
