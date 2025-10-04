namespace BDFM.Application.Features.WorkflowStepSecondary.Commands.UpdateWorkflowStepSecondary
{
    public class UpdateWorkflowStepSecondaryValidator : AbstractValidator<UpdateWorkflowStepSecondaryCommand>
    {
        public UpdateWorkflowStepSecondaryValidator()
        {
            RuleFor(x => x.Id).NotNull().WithMessage("Id cannot be null.");
            RuleFor(x => x.StepId).NotNull().WithMessage("StepId cannot be null.");
            RuleFor(x => x.RecipientType).NotNull().WithMessage("RecipientType cannot be null.");
            RuleFor(x => x.RecipientId).NotNull().WithMessage("RecipientId cannot be null.");
            RuleFor(x => x.Purpose).NotNull().WithMessage("Purpose cannot be null.");
            RuleFor(x => x.InstructionText).NotNull().WithMessage("InstructionText cannot be null.");
        }
    }
}
