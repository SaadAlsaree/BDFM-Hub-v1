namespace BDFM.Application.Features.Workflow.Commands.UpdateWorkflowStepStatus
{
    public class UpdateWorkflowStepStatusValidator : AbstractValidator<UpdateWorkflowStepStatusCommand>
    {
        public UpdateWorkflowStepStatusValidator()
        {
            RuleFor(v => v.WorkflowStepId)
                .NotEmpty().WithMessage("WorkflowStepId is required.");

            RuleFor(v => v.Status)
                .NotEmpty().WithMessage("Status is required.");
        }
    }
}
