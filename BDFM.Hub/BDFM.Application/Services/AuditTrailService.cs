using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Security;

namespace BDFM.Application.Services;

public interface IAuditTrailService
{
    /// <summary>
    /// إنشاء سجل إجراء جديد
    /// </summary>
    /// <param name="action">نوع الإجراء</param>
    /// <param name="affectedEntity">اسم الجدول المتأثر</param>
    /// <param name="affectedEntityId">معرف السجل المتأثر</param>
    /// <param name="userId">معرف المستخدم (اختياري للنظام)</param>
    /// <param name="details">تفاصيل الإجراء (اختياري)</param>
    /// <param name="ipAddress">عنوان IP (اختياري)</param>
    /// <returns>السجل المُنشأ</returns>
    Task<AuditLog> CreateAuditLogAsync(
        string action,
        string affectedEntity,
        Guid? affectedEntityId = null,
        Guid? userId = null,
        string? details = null,
        string? ipAddress = null);

    /// <summary>
    /// إنشاء سجل إجراء لمراسلة معينة
    /// </summary>
    /// <param name="action">نوع الإجراء</param>
    /// <param name="correspondenceId">معرف الكتاب</param>
    /// <param name="userId">معرف المستخدم (اختياري للنظام)</param>
    /// <param name="details">تفاصيل الإجراء (اختياري)</param>
    /// <param name="ipAddress">عنوان IP (اختياري)</param>
    /// <returns>السجل المُنشأ</returns>
    Task<AuditLog> CreateCorrespondenceAuditLogAsync(
        string action,
        Guid correspondenceId,
        Guid? userId = null,
        string? details = null,
        string? ipAddress = null);

    /// <summary>
    /// إنشاء سجل إجراء مع تفاصيل JSON
    /// </summary>
    /// <param name="action">نوع الإجراء</param>
    /// <param name="affectedEntity">اسم الجدول المتأثر</param>
    /// <param name="affectedEntityId">معرف السجل المتأثر</param>
    /// <param name="oldValues">القيم القديمة (اختياري)</param>
    /// <param name="newValues">القيم الجديدة (اختياري)</param>
    /// <param name="userId">معرف المستخدم (اختياري للنظام)</param>
    /// <param name="ipAddress">عنوان IP (اختياري)</param>
    /// <returns>السجل المُنشأ</returns>
    Task<AuditLog> CreateAuditLogWithChangesAsync(
        string action,
        string affectedEntity,
        Guid? affectedEntityId = null,
        object? oldValues = null,
        object? newValues = null,
        Guid? userId = null,
        string? ipAddress = null);

    /// <summary>
    /// إنشاء سجل إجراء لمراسلة مع تغييرات
    /// </summary>
    /// <param name="action">نوع الإجراء</param>
    /// <param name="correspondenceId">معرف الكتاب</param>
    /// <param name="oldValues">القيم القديمة (اختياري)</param>
    /// <param name="newValues">القيم الجديدة (اختياري)</param>
    /// <param name="userId">معرف المستخدم (اختياري للنظام)</param>
    /// <param name="ipAddress">عنوان IP (اختياري)</param>
    /// <returns>السجل المُنشأ</returns>
    Task<AuditLog> CreateCorrespondenceAuditLogWithChangesAsync(
        string action,
        Guid correspondenceId,
        object? oldValues = null,
        object? newValues = null,
        Guid? userId = null,
        string? ipAddress = null);

    /// <summary>
    /// جلب سجل الإجراءات الداخلية لمراسلة معينة
    /// </summary>
    /// <param name="correspondenceId">معرف الكتاب</param>
    /// <param name="includeUserDetails">هل يتضمن تفاصيل المستخدم</param>
    /// <returns>قائمة بسجل الإجراءات</returns>
    Task<List<AuditLog>> GetCorrespondenceAuditTrailAsync(Guid correspondenceId, bool includeUserDetails = true);

    /// <summary>
    /// جلب سجل الإجراءات الداخلية لمراسلة معينة مع تفاصيل إضافية
    /// </summary>
    /// <param name="correspondenceId">معرف الكتاب</param>
    /// <param name="fromDate">تاريخ البداية</param>
    /// <param name="toDate">تاريخ النهاية</param>
    /// <param name="actionTypes">أنواع الإجراءات المطلوبة</param>
    /// <returns>قائمة بسجل الإجراءات مع تفاصيل إضافية</returns>
    Task<List<AuditLog>> GetCorrespondenceAuditTrailWithFiltersAsync(
        Guid correspondenceId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        List<string>? actionTypes = null);

    /// <summary>
    /// جلب إحصائيات سجل الإجراءات لمراسلة معينة
    /// </summary>
    /// <param name="correspondenceId">معرف الكتاب</param>
    /// <returns>إحصائيات سجل الإجراءات</returns>
    Task<CorrespondenceAuditStatistics> GetCorrespondenceAuditStatisticsAsync(Guid correspondenceId);

    /// <summary>
    /// جلب آخر إجراء تم على مراسلة معينة
    /// </summary>
    /// <param name="correspondenceId">معرف الكتاب</param>
    /// <returns>آخر إجراء</returns>
    Task<AuditLog?> GetLastCorrespondenceActionAsync(Guid correspondenceId);

    Task<bool> HasCorrespondenceAuditForUserTodayAsync(Guid correspondenceId, Guid userId, CancellationToken cancellationToken);

}

public class AuditTrailService : IAuditTrailService
{
    private readonly IBaseRepository<AuditLog> _auditLogRepository;
    private readonly IBaseRepository<Correspondence> _correspondenceRepository;

    public AuditTrailService(
        IBaseRepository<AuditLog> auditLogRepository,
        IBaseRepository<Correspondence> correspondenceRepository)
    {
        _auditLogRepository = auditLogRepository;
        _correspondenceRepository = correspondenceRepository;
    }

    public async Task<List<AuditLog>> GetCorrespondenceAuditTrailAsync(Guid correspondenceId, bool includeUserDetails = true)
    {
        IQueryable<AuditLog> query = _auditLogRepository.GetQueryable()
            .Where(audit => audit.AffectedEntity == "Correspondence" && audit.AffectedEntityId == correspondenceId)
            .OrderByDescending(audit => audit.Timestamp);

        if (includeUserDetails)
        {
            query = query.Include(audit => audit.User);
        }

        return await query.ToListAsync();
    }

    public async Task<List<AuditLog>> GetCorrespondenceAuditTrailWithFiltersAsync(
        Guid correspondenceId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        List<string>? actionTypes = null)
    {
        IQueryable<AuditLog> query = _auditLogRepository.GetQueryable()
            .Where(audit => audit.AffectedEntity == "Correspondence" && audit.AffectedEntityId == correspondenceId)
            .Include(audit => audit.User);

        // تطبيق الفلاتر
        if (fromDate.HasValue)
        {
            query = query.Where(audit => audit.Timestamp >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(audit => audit.Timestamp <= toDate.Value);
        }

        if (actionTypes != null && actionTypes.Any())
        {
            query = query.Where(audit => actionTypes.Contains(audit.Action));
        }

        return await query.OrderByDescending(audit => audit.Timestamp).ToListAsync();
    }

    public async Task<CorrespondenceAuditStatistics> GetCorrespondenceAuditStatisticsAsync(Guid correspondenceId)
    {
        var auditLogs = await _auditLogRepository.GetQueryable()
            .Where(audit => audit.AffectedEntity == "Correspondence" && audit.AffectedEntityId == correspondenceId)
            .ToListAsync();

        var statistics = new CorrespondenceAuditStatistics
        {
            CorrespondenceId = correspondenceId,
            TotalActions = auditLogs.Count,
            FirstActionDate = auditLogs.Any() ? auditLogs.Min(audit => audit.Timestamp) : null,
            LastActionDate = auditLogs.Any() ? auditLogs.Max(audit => audit.Timestamp) : null,
            ActionsByType = auditLogs.GroupBy(audit => audit.Action)
                .ToDictionary(g => g.Key, g => g.Count()),
            ActionsByUser = auditLogs.Where(audit => audit.UserId.HasValue)
                .GroupBy(audit => audit.UserId)
                .ToDictionary(g => g.Key!.Value, g => g.Count())
        };

        return statistics;
    }

    public async Task<AuditLog> CreateAuditLogAsync(
        string action,
        string affectedEntity,
        Guid? affectedEntityId = null,
        Guid? userId = null,
        string? details = null,
        string? ipAddress = null)
    {
        var auditLog = new AuditLog
        {
            Action = action,
            AffectedEntity = affectedEntity,
            AffectedEntityId = affectedEntityId,
            UserId = userId,
            Details = details,
            IpAddress = ipAddress,
            Timestamp = DateTime.UtcNow
        };

        return await _auditLogRepository.Create(auditLog);
    }

    public async Task<AuditLog> CreateCorrespondenceAuditLogAsync(
        string action,
        Guid correspondenceId,
        Guid? userId = null,
        string? details = null,
        string? ipAddress = null)
    {
        return await CreateAuditLogAsync(
            action,
            "Correspondence",
            correspondenceId,
            userId,
            details,
            ipAddress);
    }

    public async Task<AuditLog> CreateAuditLogWithChangesAsync(
        string action,
        string affectedEntity,
        Guid? affectedEntityId = null,
        object? oldValues = null,
        object? newValues = null,
        Guid? userId = null,
        string? ipAddress = null)
    {
        var changeDetails = new
        {
            OldValues = oldValues,
            NewValues = newValues,
            ChangedAt = DateTime.UtcNow
        };

        var details = System.Text.Json.JsonSerializer.Serialize(changeDetails, new System.Text.Json.JsonSerializerOptions
        {
            WriteIndented = true
        });

        return await CreateAuditLogAsync(
            action,
            affectedEntity,
            affectedEntityId,
            userId,
            details,
            ipAddress);
    }

    public async Task<AuditLog> CreateCorrespondenceAuditLogWithChangesAsync(
        string action,
        Guid correspondenceId,
        object? oldValues = null,
        object? newValues = null,
        Guid? userId = null,
        string? ipAddress = null)
    {
        return await CreateAuditLogWithChangesAsync(
            action,
            "Correspondence",
            correspondenceId,
            oldValues,
            newValues,
            userId,
            ipAddress);
    }

    public async Task<AuditLog?> GetLastCorrespondenceActionAsync(Guid correspondenceId)
    {
        return await _auditLogRepository.GetQueryable()
            .Where(audit => audit.AffectedEntity == "Correspondence" && audit.AffectedEntityId == correspondenceId)
            .Include(audit => audit.User)
            .OrderByDescending(audit => audit.Timestamp)
            .FirstOrDefaultAsync();
    }

    public async Task<bool> HasCorrespondenceAuditForUserTodayAsync(Guid correspondenceId, Guid userId, CancellationToken cancellationToken)
    {
        {
            var startOfToday = DateTime.UtcNow.Date;
            var startOfTomorrow = startOfToday.AddDays(1);

            // افترض وجود _auditRepository مع Query(...) مشابه لباقي المشروع.
            return await _auditLogRepository
                .Query(a => a.AffectedEntityId == correspondenceId
                          && a.UserId == userId
                          && a.CreateAt >= startOfToday
                          && a.CreateAt < startOfTomorrow)
                .AnyAsync(cancellationToken);
        }
    }
}

/// <summary>
/// إحصائيات سجل الإجراءات لمراسلة معينة
/// </summary>
public class CorrespondenceAuditStatistics
{
    public Guid CorrespondenceId { get; set; }
    public int TotalActions { get; set; }
    public DateTime? FirstActionDate { get; set; }
    public DateTime? LastActionDate { get; set; }
    public Dictionary<string, int> ActionsByType { get; set; } = new();
    public Dictionary<Guid, int> ActionsByUser { get; set; } = new();
}