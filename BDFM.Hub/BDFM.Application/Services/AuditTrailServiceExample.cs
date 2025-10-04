using BDFM.Application.Contracts.Persistence;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Security;

namespace BDFM.Application.Services.Examples;

/// <summary>
/// أمثلة على استخدام خدمة AuditTrailService
/// </summary>
public class AuditTrailServiceExample
{
    private readonly IAuditTrailService _auditTrailService;
    private readonly IBaseRepository<Correspondence> _correspondenceRepository;

    public AuditTrailServiceExample(
        IAuditTrailService auditTrailService,
        IBaseRepository<Correspondence> correspondenceRepository)
    {
        _auditTrailService = auditTrailService;
        _correspondenceRepository = correspondenceRepository;
    }

    /// <summary>
    /// مثال: جلب سجل الإجراءات الكامل لمراسلة معينة
    /// </summary>
    public async Task<List<AuditLog>> GetFullAuditTrailExample(Guid correspondenceId)
    {
        // جلب جميع الإجراءات مع تفاصيل المستخدم
        var auditLogs = await _auditTrailService.GetCorrespondenceAuditTrailAsync(correspondenceId, true);

        Console.WriteLine($"تم العثور على {auditLogs.Count} إجراء للمراسلة {correspondenceId}");

        foreach (var audit in auditLogs)
        {
            Console.WriteLine($"- {audit.Action} بواسطة {audit.User?.FullName ?? "نظام"} في {audit.Timestamp}");
        }

        return auditLogs;
    }

    /// <summary>
    /// مثال: جلب سجل الإجراءات مع فلترة
    /// </summary>
    public async Task<List<AuditLog>> GetFilteredAuditTrailExample(Guid correspondenceId)
    {
        // جلب الإجراءات في آخر 30 يوم فقط
        var fromDate = DateTime.UtcNow.AddDays(-30);
        var actionTypes = new List<string> { "Create", "Update", "View" };

        var auditLogs = await _auditTrailService.GetCorrespondenceAuditTrailWithFiltersAsync(
            correspondenceId,
            fromDate,
            DateTime.UtcNow,
            actionTypes);

        Console.WriteLine($"تم العثور على {auditLogs.Count} إجراء في آخر 30 يوم");

        return auditLogs;
    }

    /// <summary>
    /// مثال: جلب إحصائيات الكتاب
    /// </summary>
    public async Task<CorrespondenceAuditStatistics> GetStatisticsExample(Guid correspondenceId)
    {
        var statistics = await _auditTrailService.GetCorrespondenceAuditStatisticsAsync(correspondenceId);

        Console.WriteLine($"إحصائيات الكتاب {correspondenceId}:");
        Console.WriteLine($"- إجمالي الإجراءات: {statistics.TotalActions}");
        Console.WriteLine($"- أول إجراء: {statistics.FirstActionDate}");
        Console.WriteLine($"- آخر إجراء: {statistics.LastActionDate}");

        Console.WriteLine("\nالإجراءات حسب النوع:");
        foreach (var actionType in statistics.ActionsByType)
        {
            Console.WriteLine($"- {actionType.Key}: {actionType.Value} مرة");
        }

        Console.WriteLine("\nالإجراءات حسب المستخدم:");
        foreach (var userAction in statistics.ActionsByUser)
        {
            Console.WriteLine($"- المستخدم {userAction.Key}: {userAction.Value} مرة");
        }

        return statistics;
    }

    /// <summary>
    /// مثال: جلب آخر إجراء على الكتاب
    /// </summary>
    public async Task<AuditLog?> GetLastActionExample(Guid correspondenceId)
    {
        var lastAction = await _auditTrailService.GetLastCorrespondenceActionAsync(correspondenceId);

        if (lastAction != null)
        {
            Console.WriteLine($"آخر إجراء على الكتاب {correspondenceId}:");
            Console.WriteLine($"- النوع: {lastAction.Action}");
            Console.WriteLine($"- المستخدم: {lastAction.User?.FullName ?? "نظام"}");
            Console.WriteLine($"- التاريخ: {lastAction.Timestamp}");
            Console.WriteLine($"- التفاصيل: {lastAction.Details}");
        }
        else
        {
            Console.WriteLine($"لا توجد إجراءات للمراسلة {correspondenceId}");
        }

        return lastAction;
    }

    /// <summary>
    /// مثال: مراقبة نشاط الكتاب
    /// </summary>
    public async Task MonitorCorrespondenceActivityExample(Guid correspondenceId)
    {
        Console.WriteLine($"مراقبة نشاط الكتاب {correspondenceId}...");

        // جلب الإحصائيات
        var statistics = await _auditTrailService.GetCorrespondenceAuditStatisticsAsync(correspondenceId);

        // تحليل النشاط
        if (statistics.TotalActions == 0)
        {
            Console.WriteLine("هذه الكتاب لم يتم التعامل معها بعد");
            return;
        }

        // تحديد أكثر المستخدمين نشاطاً
        var mostActiveUser = statistics.ActionsByUser
            .OrderByDescending(x => x.Value)
            .FirstOrDefault();

        if (mostActiveUser.Key != Guid.Empty)
        {
            Console.WriteLine($"أكثر المستخدمين نشاطاً: {mostActiveUser.Key} ({mostActiveUser.Value} إجراء)");
        }

        // تحديد أكثر أنواع الإجراءات شيوعاً
        var mostCommonAction = statistics.ActionsByType
            .OrderByDescending(x => x.Value)
            .FirstOrDefault();

        if (!string.IsNullOrEmpty(mostCommonAction.Key))
        {
            Console.WriteLine($"أكثر أنواع الإجراءات شيوعاً: {mostCommonAction.Key} ({mostCommonAction.Value} مرة)");
        }

        // حساب متوسط الإجراءات يومياً
        if (statistics.FirstActionDate.HasValue && statistics.LastActionDate.HasValue)
        {
            var totalDays = (statistics.LastActionDate.Value - statistics.FirstActionDate.Value).Days + 1;
            var averageActionsPerDay = (double)statistics.TotalActions / totalDays;
            Console.WriteLine($"متوسط الإجراءات يومياً: {averageActionsPerDay:F2}");
        }
    }

    /// <summary>
    /// مثال: إنشاء تقرير نشاط الكتاب
    /// </summary>
    public async Task<string> GenerateActivityReportExample(Guid correspondenceId)
    {
        var statistics = await _auditTrailService.GetCorrespondenceAuditStatisticsAsync(correspondenceId);
        var auditLogs = await _auditTrailService.GetCorrespondenceAuditTrailAsync(correspondenceId, true);

        var report = new System.Text.StringBuilder();
        report.AppendLine("=== تقرير نشاط الكتاب ===");
        report.AppendLine($"معرف الكتاب: {correspondenceId}");
        report.AppendLine($"إجمالي الإجراءات: {statistics.TotalActions}");
        report.AppendLine($"فترة النشاط: {statistics.FirstActionDate} إلى {statistics.LastActionDate}");
        report.AppendLine();

        report.AppendLine("الإجراءات حسب النوع:");
        foreach (var actionType in statistics.ActionsByType.OrderByDescending(x => x.Value))
        {
            var percentage = (double)actionType.Value / statistics.TotalActions * 100;
            report.AppendLine($"- {actionType.Key}: {actionType.Value} مرة ({percentage:F1}%)");
        }
        report.AppendLine();

        report.AppendLine("الإجراءات حسب المستخدم:");
        foreach (var userAction in statistics.ActionsByUser.OrderByDescending(x => x.Value))
        {
            var percentage = (double)userAction.Value / statistics.TotalActions * 100;
            report.AppendLine($"- المستخدم {userAction.Key}: {userAction.Value} مرة ({percentage:F1}%)");
        }
        report.AppendLine();

        report.AppendLine("آخر 5 إجراءات:");
        foreach (var audit in auditLogs.Take(5))
        {
            report.AppendLine($"- {audit.Timestamp:yyyy-MM-dd HH:mm}: {audit.Action} بواسطة {audit.User?.FullName ?? "نظام"}");
        }

        return report.ToString();
    }
}