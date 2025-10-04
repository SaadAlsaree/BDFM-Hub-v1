using BDFM.Application.Contracts.Persistence;
using BDFM.Application.Services;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using BDFM.Domain.Common;

namespace BDFM.Application.Features.Security.AuditLogs.Queries.GetCorrespondenceAuditStatistics;

public class GetCorrespondenceAuditStatisticsQueryHandler : IRequestHandler<GetCorrespondenceAuditStatisticsQuery, Response<CorrespondenceAuditStatisticsViewModel>>
{
    private readonly IAuditTrailService _auditTrailService;
    private readonly IBaseRepository<Correspondence> _correspondenceRepository;
    private readonly IBaseRepository<AuditLog> _auditLogRepository;

    public GetCorrespondenceAuditStatisticsQueryHandler(
        IAuditTrailService auditTrailService,
        IBaseRepository<Correspondence> correspondenceRepository,
        IBaseRepository<AuditLog> auditLogRepository)
    {
        _auditTrailService = auditTrailService;
        _correspondenceRepository = correspondenceRepository;
        _auditLogRepository = auditLogRepository;
    }

    public async Task<Response<CorrespondenceAuditStatisticsViewModel>> Handle(
        GetCorrespondenceAuditStatisticsQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // التحقق من وجود الكتاب
            var correspondence = await _correspondenceRepository.Find(x => x.Id == request.CorrespondenceId, cancellationToken: cancellationToken);
            if (correspondence == null)
            {
                return Response<CorrespondenceAuditStatisticsViewModel>.Fail(new MessageResponse { Message = "الكتاب غير موجودة" });
            }

            // جلب جميع سجلات الإجراءات للمراسلة
            var auditLogs = await _auditLogRepository.GetQueryable()
                .Where(audit => audit.AffectedEntity == "Correspondence" && audit.AffectedEntityId == request.CorrespondenceId)
                .Include(audit => audit.User)
                .ToListAsync(cancellationToken);

            if (!auditLogs.Any())
            {
                return Response<CorrespondenceAuditStatisticsViewModel>.Success(new CorrespondenceAuditStatisticsViewModel
                {
                    CorrespondenceId = request.CorrespondenceId,
                    TotalActions = 0
                });
            }

            var totalActions = auditLogs.Count;
            var firstActionDate = auditLogs.Min(audit => audit.Timestamp);
            var lastActionDate = auditLogs.Max(audit => audit.Timestamp);

            // إحصائيات الإجراءات حسب النوع
            var actionsByType = auditLogs
                .GroupBy(audit => audit.Action)
                .Select(group => new ActionTypeStatistics
                {
                    ActionType = group.Key,
                    ActionTypeDisplayName = GetActionDisplayName(group.Key),
                    Count = group.Count(),
                    Percentage = Math.Round((double)group.Count() / totalActions * 100, 2)
                })
                .OrderByDescending(x => x.Count)
                .ToList();

            // إحصائيات الإجراءات حسب المستخدم
            var actionsByUser = auditLogs
                .Where(audit => audit.UserId.HasValue)
                .GroupBy(audit => audit.UserId)
                .Select(group => new UserActionStatistics
                {
                    UserId = group.Key!.Value,
                    UserName = group.First().User?.FullName ?? "مستخدم غير معروف",
                    UserEmail = group.First().User?.Email ?? string.Empty,
                    Count = group.Count(),
                    Percentage = Math.Round((double)group.Count() / totalActions * 100, 2),
                    LastActionDate = group.Max(audit => audit.Timestamp)
                })
                .OrderByDescending(x => x.Count)
                .ToList();

            // إحصائيات الإجراءات حسب اليوم
            var actionsByDay = auditLogs
                .GroupBy(audit => audit.Timestamp.Date)
                .Select(group => new DailyActionStatistics
                {
                    Date = group.Key,
                    DateDisplay = group.Key.ToString("dd/MM/yyyy", CultureInfo.GetCultureInfo("ar-SA")),
                    Count = group.Count()
                })
                .OrderBy(x => x.Date)
                .ToList();

            // إحصائيات الإجراءات حسب الشهر
            var actionsByMonth = auditLogs
                .GroupBy(audit => new { audit.Timestamp.Year, audit.Timestamp.Month })
                .Select(group => new MonthlyActionStatistics
                {
                    Year = group.Key.Year,
                    Month = group.Key.Month,
                    MonthDisplay = $"{GetMonthName(group.Key.Month)} {group.Key.Year}",
                    Count = group.Count()
                })
                .OrderBy(x => x.Year)
                .ThenBy(x => x.Month)
                .ToList();

            var viewModel = new CorrespondenceAuditStatisticsViewModel
            {
                CorrespondenceId = request.CorrespondenceId,
                TotalActions = totalActions,
                FirstActionDate = firstActionDate,
                LastActionDate = lastActionDate,
                ActionsByType = actionsByType,
                ActionsByUser = actionsByUser,
                ActionsByDay = actionsByDay,
                ActionsByMonth = actionsByMonth
            };

            return Response<CorrespondenceAuditStatisticsViewModel>.Success(viewModel);
        }
        catch (Exception ex)
        {
            return Response<CorrespondenceAuditStatisticsViewModel>.Fail(new MessageResponse { Message = $"خطأ في جلب إحصائيات سجل الإجراءات: {ex.Message}" });
        }
    }

    /// <summary>
    /// تحويل نوع الإجراء إلى العربية
    /// </summary>
    private string GetActionDisplayName(string action)
    {
        return action switch
        {
            "Create" => "إنشاء",
            "Update" => "تحديث",
            "Delete" => "حذف",
            "Login" => "تسجيل دخول",
            "Logout" => "تسجيل خروج",
            "View" => "عرض",
            "Download" => "تحميل",
            "Upload" => "رفع",
            "Assign" => "تعيين",
            "Forward" => "تحويل",
            "Reply" => "رد",
            "Approve" => "موافقة",
            "Reject" => "رفض",
            "Complete" => "إكمال",
            "Archive" => "أرشفة",
            "Restore" => "استعادة",
            "Export" => "تصدير",
            "Import" => "استيراد",
            "Print" => "طباعة",
            "Share" => "مشاركة",
            _ => action
        };
    }

    /// <summary>
    /// الحصول على اسم الشهر بالعربية
    /// </summary>
    private string GetMonthName(int month)
    {
        return month switch
        {
            1 => "يناير",
            2 => "فبراير",
            3 => "مارس",
            4 => "أبريل",
            5 => "مايو",
            6 => "يونيو",
            7 => "يوليو",
            8 => "أغسطس",
            9 => "سبتمبر",
            10 => "أكتوبر",
            11 => "نوفمبر",
            12 => "ديسمبر",
            _ => month.ToString()
        };
    }
}