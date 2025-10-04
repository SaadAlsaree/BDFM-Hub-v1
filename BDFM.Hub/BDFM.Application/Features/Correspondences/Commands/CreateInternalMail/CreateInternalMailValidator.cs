namespace BDFM.Application.Features.Correspondences.Commands.CreateInternalMail
{
    public class CreateInternalMailValidator : AbstractValidator<CreateInternalMailCommand>
    {
        public CreateInternalMailValidator()
        {


            RuleFor(c => c.MailDate)
                .NotEmpty().WithMessage("Mail date is required");
            RuleFor(c => c.Subject)
                .NotEmpty().WithMessage("Subject is required")
                .MaximumLength(255).WithMessage("Subject must not exceed 255 characters");


        }
    }
}
