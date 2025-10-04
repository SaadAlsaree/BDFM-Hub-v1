using BDFM.Application.Contracts.Identity;
using BDFM.Application.Contracts.Persistence;
using BDFM.Application.Services;
using BDFM.Domain.Entities.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using BDFM.Domain.Common;

namespace BDFM.Application.Features.Security.AuditLogs.Queries.GetCorrespondenceAuditTrail;

public class GetCorrespondenceAuditTrailQueryHandler : IRequestHandler<GetCorrespondenceAuditTrailQuery, Response<List<CorrespondenceAuditTrailViewModel>>>
{
    private readonly IAuditTrailService _auditTrailService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IBaseRepository<Correspondence> _correspondenceRepository;

    public GetCorrespondenceAuditTrailQueryHandler(
        IAuditTrailService auditTrailService,
        ICurrentUserService currentUserService,
        IBaseRepository<Correspondence> correspondenceRepository)
    {
        _auditTrailService = auditTrailService;
        _currentUserService = currentUserService;
        _correspondenceRepository = correspondenceRepository;
    }

    public async Task<Response<List<CorrespondenceAuditTrailViewModel>>> Handle(
        GetCorrespondenceAuditTrailQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // التحقق من وجود الكتاب
            var correspondence = await _correspondenceRepository.Find(x => x.Id == request.CorrespondenceId, cancellationToken: cancellationToken);
            if (correspondence == null)
            {
                return Response<List<CorrespondenceAuditTrailViewModel>>.Fail(new MessageResponse { Message = "الكتاب غير موجودة" });
            }

            // جلب سجل الإجراءات
            var auditLogs = await _auditTrailService.GetCorrespondenceAuditTrailWithFiltersAsync(
                request.CorrespondenceId,
                request.FromDate,
                request.ToDate,
                request.ActionTypes);

            // تحويل إلى ViewModel
            var viewModels = auditLogs.Select(audit => new CorrespondenceAuditTrailViewModel
            {
                Id = audit.Id,
                UserId = audit.UserId,
                UserName = audit.User?.FullName ?? "نظام",
                UserEmail = audit.User?.Email,
                Timestamp = audit.Timestamp,
                Action = audit.Action,
                AffectedEntity = audit.AffectedEntity,
                AffectedEntityId = audit.AffectedEntityId,
                Details = audit.Details,
                IpAddress = audit.IpAddress,
                TimeAgo = GetTimeAgo(audit.Timestamp),
                ActionDisplayName = GetActionDisplayName(audit.Action),
                FormattedDetails = FormatDetails(audit.Details)
            }).ToList();

            return Response<List<CorrespondenceAuditTrailViewModel>>.Success(viewModels);
        }
        catch (Exception ex)
        {
            return Response<List<CorrespondenceAuditTrailViewModel>>.Fail(new MessageResponse { Message = $"خطأ في جلب سجل الإجراءات: {ex.Message}" });
        }
    }

    /// <summary>
    /// حساب الوقت المنقضي منذ الإجراء بالعربية
    /// </summary>
    private string GetTimeAgo(DateTime timestamp)
    {
        var timeSpan = DateTime.UtcNow - timestamp;

        if (timeSpan.TotalDays >= 365)
        {
            var years = (int)(timeSpan.TotalDays / 365);
            return years == 1 ? "منذ سنة واحدة" : $"منذ {years} سنوات";
        }
        else if (timeSpan.TotalDays >= 30)
        {
            var months = (int)(timeSpan.TotalDays / 30);
            return months == 1 ? "منذ شهر واحد" : $"منذ {months} أشهر";
        }
        else if (timeSpan.TotalDays >= 1)
        {
            var days = (int)timeSpan.TotalDays;
            return days == 1 ? "منذ يوم واحد" : $"منذ {days} أيام";
        }
        else if (timeSpan.TotalHours >= 1)
        {
            var hours = (int)timeSpan.TotalHours;
            return hours == 1 ? "منذ ساعة واحدة" : $"منذ {hours} ساعات";
        }
        else if (timeSpan.TotalMinutes >= 1)
        {
            var minutes = (int)timeSpan.TotalMinutes;
            return minutes == 1 ? "منذ دقيقة واحدة" : $"منذ {minutes} دقائق";
        }
        else
        {
            return "الآن";
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
    /// تنسيق تفاصيل الإجراء
    /// </summary>
    private string FormatDetails(string? details)
    {
        if (string.IsNullOrEmpty(details))
            return string.Empty;

        try
        {
            // محاولة تحليل JSON إذا كان التفاصيل بتنسيق JSON
            if (details.StartsWith("{") || details.StartsWith("["))
            {
                // يمكن إضافة منطق تنسيق JSON هنا
                return details;
            }

            return details;
        }
        catch
        {
            return details;
        }
    }
}