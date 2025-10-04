namespace BDFM.Application.Features.CustomWorkflows.Commands.CreateCustomWorkflow
{
    public class CreateCustomWorkflowValidator : AbstractValidator<CreateCustomWorkflowCommand>
    {
        public CreateCustomWorkflowValidator()
        {
            RuleFor(x => x.WorkflowName).NotEmpty().WithMessage("Workflow name is required");
            RuleFor(x => x.TriggeringUnitId).NotEmpty().WithMessage("Triggering unit is required");
            RuleFor(x => x.TriggeringCorrespondenceType).NotEmpty().WithMessage("Triggering correspondence type is required");
        }
    }
}
