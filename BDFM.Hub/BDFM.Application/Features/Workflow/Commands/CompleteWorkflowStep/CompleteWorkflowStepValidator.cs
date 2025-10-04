namespace BDFM.Application.Features.Workflow.Commands.CompleteWorkflowStep
{
    public class CompleteWorkflowStepValidator : AbstractValidator<CompleteWorkflowStepCommand>
    {
        public CompleteWorkflowStepValidator()
        {
            RuleFor(v => v.WorkflowStepId)
                .NotEmpty().WithMessage("WorkflowStepId is required.");
        }
    }
}
