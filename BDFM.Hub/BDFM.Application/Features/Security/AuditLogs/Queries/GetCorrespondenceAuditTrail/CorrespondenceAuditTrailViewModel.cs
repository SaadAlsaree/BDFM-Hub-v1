namespace BDFM.Application.Features.Security.AuditLogs.Queries.GetCorrespondenceAuditTrail;

/// <summary>
/// نموذج عرض سجل الإجراءات الداخلية لمراسلة معينة
/// </summary>
public class CorrespondenceAuditTrailViewModel
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    public DateTime Timestamp { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? AffectedEntity { get; set; }
    public Guid? AffectedEntityId { get; set; }
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
    
    /// <summary>
    /// الوقت المنقضي منذ الإجراء (بالعربية)
    /// </summary>
    public string TimeAgo { get; set; } = string.Empty;
    
    /// <summary>
    /// نوع الإجراء بالعربية
    /// </summary>
    public string ActionDisplayName { get; set; } = string.Empty;
    
    /// <summary>
    /// تفاصيل الإجراء المنسقة
    /// </summary>
    public string FormattedDetails { get; set; } = string.Empty;
} 