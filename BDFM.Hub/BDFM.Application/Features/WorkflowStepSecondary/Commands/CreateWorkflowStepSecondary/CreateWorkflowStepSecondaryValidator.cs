namespace BDFM.Application.Features.WorkflowStepSecondary.Commands.CreateWorkflowStepSecondary
{
    public class CreateWorkflowStepSecondaryValidator : AbstractValidator<CreateWorkflowStepSecondaryCommand>
    {
        public CreateWorkflowStepSecondaryValidator()
        {
            RuleFor(x => x.StepId).NotNull().WithMessage("StepId cannot be null.");
            RuleFor(x => x.RecipientType).NotNull().WithMessage("RecipientType cannot be null.");
            RuleFor(x => x.RecipientId).NotNull().WithMessage("RecipientId cannot be null.");
            RuleFor(x => x.Purpose).NotNull().WithMessage("Purpose cannot be null.");
            RuleFor(x => x.InstructionText).NotNull().WithMessage("InstructionText cannot be null.");
        }
    }
}
