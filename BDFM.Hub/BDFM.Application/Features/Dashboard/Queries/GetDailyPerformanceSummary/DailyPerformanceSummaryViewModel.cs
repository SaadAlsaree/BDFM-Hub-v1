namespace BDFM.Application.Features.Dashboard.Queries.GetDailyPerformanceSummary;

public class DailyPerformanceSummaryViewModel
{
    public DateTime Date { get; set; }
    public string DateDisplay { get; set; } = string.Empty; // Arabic formatted date
    public int TodaysProcessingCorrespondence { get; set; }
    public double CompletionRate { get; set; } // Percentage
    public double AverageProcessingTimeHours { get; set; }
    public int ActiveUnitsCount { get; set; }
    public List<ActiveUnitSummary> ActiveUnits { get; set; } = new();
    public DailyBreakdown Breakdown { get; set; } = new();
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    public Guid? FilteredByUnitId { get; set; }
    public string? FilteredByUnitName { get; set; }
}

public class ActiveUnitSummary
{
    public Guid UnitId { get; set; }
    public string UnitName { get; set; } = string.Empty;
    public string UnitCode { get; set; } = string.Empty;
    public int ProcessingCount { get; set; }
    public int CompletedCount { get; set; }
    public double CompletionRate { get; set; }
    public double AverageProcessingTimeHours { get; set; }
    public int ActiveTasksCount { get; set; }
    public string PerformanceStatus { get; set; } = string.Empty; // "Excellent", "Good", "Average", "Poor"
}

public class DailyBreakdown
{
    public int IncomingCorrespondence { get; set; }
    public int OutgoingCorrespondence { get; set; }
    public int InternalCorrespondence { get; set; }
    public int CompletedToday { get; set; }
    public int StartedToday { get; set; }
    public int OverdueCompleted { get; set; } // Tasks completed that were overdue
    public int OnTimeCompleted { get; set; } // Tasks completed on or before due date
    public CorrespondenceVelocity Velocity { get; set; } = new();
}

public class CorrespondenceVelocity
{
    public double ItemsPerHour { get; set; }
    public double ItemsPerDay { get; set; }
    public string TrendDirection { get; set; } = string.Empty; // "Up", "Down", "Stable"
    public double TrendPercentage { get; set; }
    public TimeSpan PeakProcessingTime { get; set; } // Hour of day when most processing happens
}
