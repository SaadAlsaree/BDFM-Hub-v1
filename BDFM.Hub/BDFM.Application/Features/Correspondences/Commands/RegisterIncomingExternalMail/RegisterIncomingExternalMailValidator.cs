namespace BDFM.Application.Features.Correspondences.Commands.RegisterIncomingExternalMail
{
    public class RegisterIncomingExternalMailValidator : AbstractValidator<RegisterIncomingExternalMailCommand>
    {
        private readonly string[] _allowedExtensions = { ".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".tif", ".tiff" };

        public RegisterIncomingExternalMailValidator()
        {
            RuleFor(c => c.ExternalReferenceNumber)
                .NotEmpty().WithMessage("External reference number is required")
                .MaximumLength(100).WithMessage("External reference number must not exceed 100 characters");

            RuleFor(c => c.ExternalReferenceDate)
                .NotEmpty().WithMessage("External reference date is required")
                .LessThanOrEqualTo(DateTime.Today).WithMessage("External reference date cannot be in the future");

            RuleFor(c => c.OriginatingExternalEntityId)
                .NotEmpty().WithMessage("Originating external entity id is required");

            RuleFor(c => c.Subject)
                .NotEmpty().WithMessage("Subject is required")
                .MaximumLength(500).WithMessage("Subject must not exceed 500 characters");

            RuleFor(c => c.BodyText)
                .MaximumLength(5000).WithMessage("Body text must not exceed 5000 characters");

            RuleFor(x => x.SecrecyLevel)
                .IsInEnum().WithMessage("Invalid secrecy level");

            RuleFor(x => x.PriorityLevel)
                .IsInEnum().WithMessage("Invalid priority level");

            RuleFor(x => x.PersonalityLevel)
                .IsInEnum().WithMessage("Invalid personality level");


            RuleFor(c => c.CreatedByUserId)
                .NotEmpty().WithMessage("Created by user id is required");
        }
    }
}
