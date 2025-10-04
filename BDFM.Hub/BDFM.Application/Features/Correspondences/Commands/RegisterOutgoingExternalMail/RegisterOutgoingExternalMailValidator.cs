namespace BDFM.Application.Features.Correspondences.Commands.RegisterOutgoingExternalMail
{
    public class RegisterOutgoingExternalMailValidator : AbstractValidator<RegisterOutgoingExternalMailCommand>
    {
        public RegisterOutgoingExternalMailValidator()
        {
            RuleFor(x => x.Subject).NotEmpty().WithMessage("Subject is required");
            RuleFor(x => x.BodyText).NotEmpty().WithMessage("Body text is required");
            RuleFor(x => x.MailDate).NotEmpty().WithMessage("Mail date is required");
            RuleFor(x => x.ExternalEntityId).NotEmpty().WithMessage("External entity id is required");
        }
    }
}
