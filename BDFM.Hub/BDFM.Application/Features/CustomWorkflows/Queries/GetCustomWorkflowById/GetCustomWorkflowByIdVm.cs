namespace BDFM.Application.Features.CustomWorkflows.Queries.GetCustomWorkflowById;

public class GetCustomWorkflowByIdVm
{
    public Guid Id { get; set; }
    public string WorkflowName { get; set; } = string.Empty;
    public Guid? TriggeringUnitId { get; set; }
    public string TriggeringUnitName { get; set; } = string.Empty;
    public CorrespondenceTypeEnum? TriggeringCorrespondenceType { get; set; }
    public string TriggeringCorrespondenceTypeName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsEnabled { get; set; }
    public DateTime CreateAt { get; set; }
    public DateTime? LastUpdateAt { get; set; }
    public string? CreateBy { get; set; }
    public string? LastUpdateBy { get; set; }
    public int Status { get; set; }
    public string StatusName { get; set; } = string.Empty;

    public virtual ICollection<CustomWorkflowStepDto> Steps { get; set; } = new HashSet<CustomWorkflowStepDto>();
}


public class CustomWorkflowStepDto
{
    public Guid Id { get; set; }
    public Guid WorkflowId { get; set; }
    public int StepOrder { get; set; }
    public ActionTypeEnum ActionType { get; set; }
    public string ActionTypeName { get; set; } = string.Empty;
    public CustomWorkflowTargetTypeEnum TargetType { get; set; }
    public string TargetTypeName { get; set; } = string.Empty;
    public string? TargetIdentifier { get; set; } // UserID, UnitID, RoleName, etc.
    public string? TargetIdentifierName { get; set; } = string.Empty;
    public string? DefaultInstructionText { get; set; } // Text type in DB
    public int? DefaultDueDateOffsetDays { get; set; } // In days from previous step
}
