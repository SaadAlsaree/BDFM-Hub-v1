using BDFM.Application.Features.Dashboard.Queries.GetDashboardOverview;

namespace BDFM.Application.Features.Dashboard.Queries.GetBacklogDetails;

public class BacklogDetailsViewModel
{
    public BacklogMetrics Summary { get; set; } = new();
    public List<BacklogTaskDetail> TaskDetails { get; set; } = new();
    public List<UnitBacklogDetail> UnitBreakdown { get; set; } = new();
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}

public class BacklogTaskDetail
{
    public Guid TaskId { get; set; }
    public Guid CorrespondenceId { get; set; }
    public string CorrespondenceSubject { get; set; } = string.Empty;
    public string MailNum { get; set; } = string.Empty;
    public WorkflowStepStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public ActionTypeEnum ActionType { get; set; }
    public string ActionTypeName { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public DateTime? DueDate { get; set; }
    public int DaysInBacklog { get; set; }
    public int? DaysOverdue { get; set; }
    public string FromUnitName { get; set; } = string.Empty;
    public string? InstructionText { get; set; }
    public bool IsTimeSensitive { get; set; }
}

public class UnitBacklogDetail : UnitBacklogSummary
{
    public double AverageTaskAge { get; set; }
    public int TasksDueToday { get; set; }
    public int TasksDueThisWeek { get; set; }
    public List<BacklogTaskDetail> TopOverdueTasks { get; set; } = new();
}
