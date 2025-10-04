namespace BDFM.Application.Features.Security.AuditLogs.Queries.GetAuditLogById;

public class AuditLogViewModel
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string? UserName { get; set; }
    public DateTime Timestamp { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? AffectedEntity { get; set; }
    public Guid? AffectedEntityId { get; set; }
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
}
