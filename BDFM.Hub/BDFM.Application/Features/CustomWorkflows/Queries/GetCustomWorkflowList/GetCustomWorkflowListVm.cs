namespace BDFM.Application.Features.CustomWorkflows.Queries.GetCustomWorkflowList;

public class GetCustomWorkflowListVm
{
    public Guid Id { get; set; }
    public string WorkflowName { get; set; } = string.Empty;
    public Guid? TriggeringUnitId { get; set; }
    public CorrespondenceTypeEnum? TriggeringCorrespondenceType { get; set; }
    public string? Description { get; set; }
    public bool IsEnabled { get; set; }
    public DateTime CreateAt { get; set; }
    public DateTime? LastUpdateAt { get; set; }
    public string? CreateBy { get; set; }
    public string? LastUpdateBy { get; set; }
    public int Status { get; set; }
    public string StatusName { get; set; } = string.Empty;

}


