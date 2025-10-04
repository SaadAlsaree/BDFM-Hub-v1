using MediatR;
using BDFM.Domain.Entities.Security;

namespace BDFM.Application.Features.Security.AuditLogs.Commands.CreateAuditLog;

public class CreateAuditLogCommand : IRequest<Response<AuditLog>>
{
    /// <summary>
    /// نوع الإجراء
    /// </summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>
    /// اسم الجدول المتأثر
    /// </summary>
    public string AffectedEntity { get; set; } = string.Empty;

    /// <summary>
    /// معرف السجل المتأثر
    /// </summary>
    public Guid? AffectedEntityId { get; set; }

    /// <summary>
    /// معرف المستخدم (اختياري للنظام)
    /// </summary>
    public Guid? UserId { get; set; }

    /// <summary>
    /// تفاصيل الإجراء (اختياري)
    /// </summary>
    public string? Details { get; set; }

    /// <summary>
    /// عنوان IP (اختياري)
    /// </summary>
    public string? IpAddress { get; set; }
}