namespace BDFM.Application.Features.Workflow.Queries.GetWorkflowStepsStatisticsByUnit;

public class WorkflowStepsStatisticsAllVm
{
    public List<WorkflowStepsStatisticsVm> Units { get; set; } = new();
}

public class WorkflowStepsStatisticsVm
{
    public Guid UnitId { get; set; }
    public string UnitName { get; set; } = string.Empty;
    public string UnitCode { get; set; } = string.Empty;
    public UnitType UnitType { get; set; }
    public string UnitTypeName { get; set; } = string.Empty;

    public int TotalWorkflowSteps { get; set; }
    public int PendingCount { get; set; }
    public int InProgressCount { get; set; }
    public int CompletedCount { get; set; }
    public int RejectedCount { get; set; }
    public int DelegatedCount { get; set; }
    public int ReturnedCount { get; set; }
    public int DelayedCount { get; set; }
}

