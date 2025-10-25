namespace BDFM.Application.Features.CustomWorkflowSteps.Commands.CreateCustomWorkflowStep;
using FluentValidation;

internal class CreateCustomWorkflowStepValidator : AbstractValidator<CreateCustomWorkflowStepCommand>
{
    public CreateCustomWorkflowStepValidator()
    {
        RuleFor(x => x.WorkflowId).NotEmpty().WithMessage("Workflow ID is required");
        RuleFor(x => x.StepOrder).GreaterThan(0).WithMessage("Step order must be greater than 0");
        RuleFor(x => x.ActionType).NotEmpty().WithMessage("Action type is required");
        RuleFor(x => x.TargetType).NotEmpty().WithMessage("Target type is required");
        RuleFor(x => x.IsActive).NotEmpty().WithMessage("Is active is required");
    }
}
