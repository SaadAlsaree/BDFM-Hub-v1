namespace BDFM.Application.Features.Security.AuditLogs.Queries.GetCorrespondenceAuditStatistics;

/// <summary>
/// نموذج عرض إحصائيات سجل الإجراءات لمراسلة معينة
/// </summary>
public class CorrespondenceAuditStatisticsViewModel
{
    public Guid CorrespondenceId { get; set; }
    public int TotalActions { get; set; }
    public DateTime? FirstActionDate { get; set; }
    public DateTime? LastActionDate { get; set; }
    
    /// <summary>
    /// إحصائيات الإجراءات حسب النوع
    /// </summary>
    public List<ActionTypeStatistics> ActionsByType { get; set; } = new();
    
    /// <summary>
    /// إحصائيات الإجراءات حسب المستخدم
    /// </summary>
    public List<UserActionStatistics> ActionsByUser { get; set; } = new();
    
    /// <summary>
    /// إحصائيات الإجراءات حسب اليوم
    /// </summary>
    public List<DailyActionStatistics> ActionsByDay { get; set; } = new();
    
    /// <summary>
    /// إحصائيات الإجراءات حسب الشهر
    /// </summary>
    public List<MonthlyActionStatistics> ActionsByMonth { get; set; } = new();
}

/// <summary>
/// إحصائيات الإجراءات حسب النوع
/// </summary>
public class ActionTypeStatistics
{
    public string ActionType { get; set; } = string.Empty;
    public string ActionTypeDisplayName { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
}

/// <summary>
/// إحصائيات الإجراءات حسب المستخدم
/// </summary>
public class UserActionStatistics
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
    public DateTime? LastActionDate { get; set; }
}

/// <summary>
/// إحصائيات الإجراءات حسب اليوم
/// </summary>
public class DailyActionStatistics
{
    public DateTime Date { get; set; }
    public string DateDisplay { get; set; } = string.Empty;
    public int Count { get; set; }
}

/// <summary>
/// إحصائيات الإجراءات حسب الشهر
/// </summary>
public class MonthlyActionStatistics
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string MonthDisplay { get; set; } = string.Empty;
    public int Count { get; set; }
} 