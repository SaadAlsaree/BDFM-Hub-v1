namespace BDFM.Application.Features.CustomWorkflows.Commands.UpdateCustomWorkflow
{
    internal class UpdateCustomWorkflowValidator : AbstractValidator<UpdateCustomWorkflowCommand>
    {
        public UpdateCustomWorkflowValidator()
        {
            RuleFor(x => x.Id).NotEmpty().WithMessage("Id is required");
            RuleFor(x => x.WorkflowName).NotEmpty().WithMessage("Workflow name is required");
            RuleFor(x => x.TriggeringUnitId).NotEmpty().WithMessage("Triggering unit is required");
        }
    }
}
