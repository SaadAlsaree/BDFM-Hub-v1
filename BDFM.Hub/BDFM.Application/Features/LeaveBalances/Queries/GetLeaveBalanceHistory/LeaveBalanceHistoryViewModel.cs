namespace BDFM.Application.Features.LeaveBalances.Queries.GetLeaveBalanceHistory;

public class LeaveBalanceHistoryViewModel
{
    public Guid Id { get; set; }
    public Guid? LeaveRequestId { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public string? EmployeeNumber { get; set; }
    public string? EmployeeName { get; set; }

    public LeaveTypeEnum LeaveType { get; set; }
    public string LeaveTypeName { get; set; } = string.Empty; // Auto-populated

    public decimal PreviousBalance { get; set; }
    public decimal NewBalance { get; set; }
    public decimal ChangeAmount { get; set; } // قيمة التغيير: + أو -
    public string ChangeReason { get; set; } = string.Empty;

    public Guid? ChangedByUserId { get; set; }
    public string? ChangedByUserName { get; set; }
    public DateTime ChangeDate { get; set; }
    public string ChangeType { get; set; } = string.Empty; // "Approval", "Cancellation", "Interruption", "MonthlyReset", "HRSync"

    public DateTime CreateAt { get; set; }
}



