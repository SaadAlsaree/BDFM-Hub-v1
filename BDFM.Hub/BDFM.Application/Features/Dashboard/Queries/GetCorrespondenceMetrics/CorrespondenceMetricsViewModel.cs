using BDFM.Application.Features.Dashboard.Queries.GetDashboardOverview;

namespace BDFM.Application.Features.Dashboard.Queries.GetCorrespondenceMetrics;

public class CorrespondenceMetricsViewModel
{
    public int TotalCount { get; set; }
    public int ActiveCount { get; set; }
    public int CompletedCount { get; set; }
    public int PendingCount { get; set; }
    public int OverdueCount { get; set; }
    public double AverageProcessingTimeInDays { get; set; }
    public List<MonthlyVolumeData> MonthlyVolume { get; set; } = new();
    public List<CorrespondenceTypeDistribution> TypeDistribution { get; set; } = new();
    public List<CorrespondenceStatusDistribution> StatusDistribution { get; set; } = new();
    public List<PriorityDistribution> PriorityDistribution { get; set; } = new();
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}

public class MonthlyVolumeData
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public int Count { get; set; }
    public int IncomingCount { get; set; }
    public int OutgoingCount { get; set; }
    public int InternalCount { get; set; }
}

public class PriorityDistribution
{
    public PriorityLevelEnum Priority { get; set; }
    public string PriorityName { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
}
