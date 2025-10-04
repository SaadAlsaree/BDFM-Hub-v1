namespace BDFM.Application.Features.Correspondences.Commands.UpdateCorrespondenceContent
{
    public class UpdateCorrespondenceContentValidator : AbstractValidator<UpdateCorrespondenceContentCommand>
    {
        public UpdateCorrespondenceContentValidator()
        {
            RuleFor(v => v.CorrespondenceId)
                .NotEmpty().WithMessage("Correspondence ID is required");

            RuleFor(v => v.Subject)
                .NotEmpty().WithMessage("Subject is required");

            RuleFor(v => v.BodyText)
                .NotEmpty().WithMessage("Body text is required");

            RuleFor(v => v.SecrecyLevel)
                .NotEmpty().WithMessage("Secrecy level is required");

            RuleFor(v => v.PriorityLevel)
                .NotEmpty().WithMessage("Priority level is required");

            RuleFor(v => v.PersonalityLevel)
                .NotEmpty().WithMessage("Personality level is required");
        }
    }
}
