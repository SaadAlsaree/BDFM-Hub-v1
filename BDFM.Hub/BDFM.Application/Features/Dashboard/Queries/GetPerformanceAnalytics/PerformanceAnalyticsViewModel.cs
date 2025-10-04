namespace BDFM.Application.Features.Dashboard.Queries.GetPerformanceAnalytics;

public class PerformanceAnalyticsViewModel
{
    public ProcessingTimeMetrics ProcessingTime { get; set; } = new();
    public ThroughputMetrics Throughput { get; set; } = new();
    public EfficiencyMetrics Efficiency { get; set; } = new();
    public List<UnitPerformance> UnitPerformances { get; set; } = new();
    public List<UserPerformance> TopPerformers { get; set; } = new();
    public TrendAnalysis Trends { get; set; } = new();
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}

public class ProcessingTimeMetrics
{
    public double AverageProcessingTimeDays { get; set; }
    public double MedianProcessingTimeDays { get; set; }
    public double FastestProcessingTimeDays { get; set; }
    public double SlowestProcessingTimeDays { get; set; }
    public List<ProcessingTimeByType> ByCorrespondenceType { get; set; } = new();
}

public class ProcessingTimeByType
{
    public CorrespondenceTypeEnum Type { get; set; }
    public string TypeName { get; set; } = string.Empty;
    public double AverageTimeDays { get; set; }
    public int Count { get; set; }
}

public class ThroughputMetrics
{
    public int CorrespondencePerDay { get; set; }
    public int CorrespondencePerWeek { get; set; }
    public int CorrespondencePerMonth { get; set; }
    public List<DailyThroughput> DailyThroughput { get; set; } = new();
}

public class DailyThroughput
{
    public DateTime Date { get; set; }
    public int IncomingCount { get; set; }
    public int OutgoingCount { get; set; }
    public int ProcessedCount { get; set; }
}

public class EfficiencyMetrics
{
    public double CompletionRate { get; set; } // Percentage of correspondence completed
    public double OnTimeDeliveryRate { get; set; } // Percentage completed before due date
    public double FirstPassResolutionRate { get; set; } // Percentage resolved without returns
    public int AverageStepsPerCorrespondence { get; set; }
}

public class UnitPerformance
{
    public Guid UnitId { get; set; }
    public string UnitName { get; set; } = string.Empty;
    public string UnitCode { get; set; } = string.Empty;
    public int TotalProcessed { get; set; }
    public double AverageProcessingTime { get; set; }
    public double CompletionRate { get; set; }
    public int PendingCount { get; set; }
    public int OverdueCount { get; set; }
    public double EfficiencyScore { get; set; } // Calculated composite score
}

public class UserPerformance
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UnitName { get; set; } = string.Empty;
    public int TotalProcessed { get; set; }
    public double AverageProcessingTime { get; set; }
    public double CompletionRate { get; set; }
    public int CurrentWorkload { get; set; }
}

public class TrendAnalysis
{
    public double VolumeGrowthRate { get; set; } // Month over month growth
    public double ProcessingTimeImprovement { get; set; } // Improvement in processing time
    public List<MonthlyTrend> MonthlyTrends { get; set; } = new();
}

public class MonthlyTrend
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public int Volume { get; set; }
    public double AverageProcessingTime { get; set; }
    public double CompletionRate { get; set; }
}
