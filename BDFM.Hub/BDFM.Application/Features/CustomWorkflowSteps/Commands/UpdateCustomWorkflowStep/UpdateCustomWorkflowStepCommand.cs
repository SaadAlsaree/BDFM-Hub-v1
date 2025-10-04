namespace BDFM.Application.Features.CustomWorkflowSteps.Commands.UpdateCustomWorkflowStep;

using MediatR;

public class UpdateCustomWorkflowStepCommand : IRequest<Response<bool>>
{
    public Guid Id { get; set; }
    public Guid WorkflowId { get; set; }
    public int StepOrder { get; set; }
    public ActionTypeEnum ActionType { get; set; }
    public CustomWorkflowTargetTypeEnum TargetType { get; set; }
    public string? TargetIdentifier { get; set; } // UserID, UnitID, RoleName, etc.
    public string? DefaultInstructionText { get; set; } // Text type in DB
    public int? DefaultDueDateOffsetDays { get; set; } // In days from previous step
}
