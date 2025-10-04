namespace BDFM.Application.Features.Dashboard.Queries.GetDashboardOverview;

public class DashboardOverviewViewModel
{
    public int UnreadIncomingMailCount { get; set; }
    public int TotalActiveCorrespondence { get; set; }
    public int TotalCorrespondence { get; set; }
    public double AverageMonthlyVolume { get; set; }
    public List<CorrespondenceTypeDistribution> CorrespondenceTypeDistribution { get; set; } = new();
    public List<UnitCorrespondenceVolume> TopUnitsReceivingCorrespondence { get; set; } = new();
    public AutomationPerformanceMetrics AutomationPerformance { get; set; } = new();
    public List<CorrespondenceStatusDistribution> CorrespondenceStatusDistribution { get; set; } = new();
    public BacklogMetrics BacklogMetrics { get; set; } = new();
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    public Guid? FilteredByUnitId { get; set; }
    public string? FilteredByUnitName { get; set; }
}

public class CorrespondenceTypeDistribution
{
    public CorrespondenceTypeEnum CorrespondenceType { get; set; }
    public string TypeName { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
}

public class UnitCorrespondenceVolume
{
    public Guid UnitId { get; set; }
    public string UnitName { get; set; } = string.Empty;
    public string UnitCode { get; set; } = string.Empty;
    public int CorrespondenceCount { get; set; }
    public int IncomingCount { get; set; }
    public int OutgoingCount { get; set; }
    public int InternalCount { get; set; }
}

public class AutomationPerformanceMetrics
{
    public double SuccessRate { get; set; }
    public double AverageExecutionTimeMinutes { get; set; }
    public int TotalAutomatedProcesses { get; set; }
    public int SuccessfulProcesses { get; set; }
    public int FailedProcesses { get; set; }
    public List<AutomationTypePerformance> ByAutomationType { get; set; } = new();
}

public class AutomationTypePerformance
{
    public string AutomationType { get; set; } = string.Empty;
    public double SuccessRate { get; set; }
    public double AverageExecutionTimeMinutes { get; set; }
    public int TotalProcesses { get; set; }
}

public class CorrespondenceStatusDistribution
{
    public CorrespondenceStatusEnum Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
}

public class BacklogMetrics
{
    public int TotalBackloggedTasks { get; set; }
    public int OverdueTasks { get; set; }
    public int TasksDueToday { get; set; }
    public int TasksDueThisWeek { get; set; }
    public double AverageTaskAge { get; set; } // In days
    public List<UnitBacklogSummary> ByUnit { get; set; } = new();
}

public class UnitBacklogSummary
{
    public Guid UnitId { get; set; }
    public string UnitName { get; set; } = string.Empty;
    public string UnitCode { get; set; } = string.Empty;
    public int BackloggedTasks { get; set; }
    public int OverdueTasks { get; set; }
}
