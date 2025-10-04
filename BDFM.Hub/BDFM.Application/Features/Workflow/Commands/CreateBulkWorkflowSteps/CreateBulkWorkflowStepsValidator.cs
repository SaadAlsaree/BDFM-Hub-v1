namespace BDFM.Application.Features.Workflow.Commands.CreateBulkWorkflowSteps
{
    public class CreateBulkWorkflowStepsValidator : AbstractValidator<CreateBulkWorkflowStepsCommand>
    {
        public CreateBulkWorkflowStepsValidator()
        {
            RuleFor(x => x.CorrespondenceId).NotEmpty().WithMessage("Correspondence ID is required.");

            RuleFor(x => x.WorkflowSteps)
                .NotEmpty().WithMessage("Workflow steps list is required.")
                .Must(steps => steps != null && steps.Any()).WithMessage("At least one workflow step is required.");

            RuleForEach(x => x.WorkflowSteps)
                .SetValidator(new WorkflowStepItemValidator());
        }
    }

    public class WorkflowStepItemValidator : AbstractValidator<WorkflowStepItem>
    {
        public WorkflowStepItemValidator()
        {
            RuleFor(x => x.ToPrimaryRecipientId).NotEmpty().WithMessage("Primary recipient ID is required.");
            RuleFor(x => x.ToPrimaryRecipientType).NotEmpty().WithMessage("Primary recipient type is required.");
            RuleFor(x => x.DueDate).NotEmpty().WithMessage("Due date is required.");
            RuleFor(x => x.InstructionText).NotEmpty().WithMessage("Instruction text is required.");
        }
    }
}
