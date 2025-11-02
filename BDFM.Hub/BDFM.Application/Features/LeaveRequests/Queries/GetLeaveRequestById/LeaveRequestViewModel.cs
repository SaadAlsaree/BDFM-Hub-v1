using BDFM.Application.Features.LeaveInterruptions.Queries.GetLeaveInterruptionsByRequestId;
using BDFM.Application.Features.LeaveCancellations.Queries.GetLeaveCancellationsByRequestId;

namespace BDFM.Application.Features.LeaveRequests.Queries.GetLeaveRequestById;

public class LeaveRequestViewModel
{
    public Guid Id { get; set; }
    public string EmployeeId { get; set; } = string.Empty; // معرف الموظف من نظام HR
    public string? EmployeeNumber { get; set; } // رقم الموظف من HR
    public string? EmployeeName { get; set; } // اسم الموظف من HR
    public Guid? OrganizationalUnitId { get; set; }
    public string? OrganizationalUnitName { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public string? CreatedByUserName { get; set; }

    public LeaveTypeEnum LeaveType { get; set; }
    public string LeaveTypeName { get; set; } = string.Empty; // Auto-populated
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int RequestedDays { get; set; }
    public int? ApprovedDays { get; set; }
    
    // HR Balance Snapshot (from frontend at time of request creation)
    public decimal TotalBalance { get; set; }
    public decimal MonthlyBalance { get; set; }
    public decimal UsedBalance { get; set; }
    public decimal AvailableBalance { get; set; }
    public decimal MonthlyUsedBalance { get; set; }
    public DateTime? LastMonthlyResetDate { get; set; }
    
    public LeaveRequestStatusEnum Status { get; set; }
    public string StatusName { get; set; } = string.Empty; // Auto-populated

    public string? Reason { get; set; }
    public string? RejectionReason { get; set; }

    public DateTime? ApprovedAt { get; set; }
    public Guid? ApprovedByUserId { get; set; }
    public string? ApprovedByUserName { get; set; }

    public Guid? CancelledByUserId { get; set; }
    public string? CancelledByUserName { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }

    public bool IsInterrupted { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public string? RequestNumber { get; set; }

    // Audit fields
    public DateTime CreateAt { get; set; }
    public Guid? CreateBy { get; set; }
    public DateTime? LastUpdateAt { get; set; }
    public Guid? LastUpdateBy { get; set; }
    public int StatusId { get; set; } // For StatusName auto-population

    // Navigation properties (optional - can be loaded separately)
    public List<LeaveInterruptionViewModel> Interruptions { get; set; } = new List<LeaveInterruptionViewModel>();
    public List<LeaveCancellationViewModel> Cancellations { get; set; } = new List<LeaveCancellationViewModel>();
}

