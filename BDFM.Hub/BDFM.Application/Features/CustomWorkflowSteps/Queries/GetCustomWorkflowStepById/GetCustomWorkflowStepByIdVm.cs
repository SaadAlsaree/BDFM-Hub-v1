namespace BDFM.Application.Features.CustomWorkflowSteps.Queries.GetCustomWorkflowStepById;

public class GetCustomWorkflowStepByIdVm
{
    public Guid Id { get; set; }
    public Guid WorkflowId { get; set; }
    public int StepOrder { get; set; }
    public ActionTypeEnum ActionType { get; set; }
    public CustomWorkflowTargetTypeEnum TargetType { get; set; }
    public string? TargetIdentifier { get; set; } // UserID, UnitID, RoleName, etc.
    public string? DefaultInstructionText { get; set; } // Text type in DB
    public int? DefaultDueDateOffsetDays { get; set; } // In days from previous step
    public DateTime CreateAt { get; set; }
    public DateTime? LastUpdateAt { get; set; }
    public string? CreateBy { get; set; }
    public string? LastUpdateBy { get; set; }
    public int StatusId { get; set; }
    public int Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
}
