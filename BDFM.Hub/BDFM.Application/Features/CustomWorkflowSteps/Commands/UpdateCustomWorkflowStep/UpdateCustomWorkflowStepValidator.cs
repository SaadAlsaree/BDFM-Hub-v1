namespace BDFM.Application.Features.CustomWorkflowSteps.Commands.UpdateCustomWorkflowStep;
using FluentValidation;

public class UpdateCustomWorkflowStepValidator : AbstractValidator<UpdateCustomWorkflowStepCommand>
{
    public UpdateCustomWorkflowStepValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
        RuleFor(x => x.WorkflowId).NotEmpty().WithMessage("Workflow ID is required");
        RuleFor(x => x.StepOrder).GreaterThan(0).WithMessage("Step order must be greater than 0");
        RuleFor(x => x.ActionType).NotEmpty().WithMessage("Action type is required");
        RuleFor(x => x.TargetType).NotEmpty().WithMessage("Target type is required");
        RuleFor(x => x.IsActive).NotEmpty().WithMessage("Is active is required");
    }
}
