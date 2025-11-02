namespace BDFM.Application.Features.LeaveRequests.Queries.GetAllLeaveRequests;

public class LeaveRequestListViewModel
{
    public Guid Id { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public string? EmployeeNumber { get; set; }
    public string? EmployeeName { get; set; }
    public Guid? OrganizationalUnitId { get; set; }
    public string? OrganizationalUnitName { get; set; }

    public LeaveTypeEnum LeaveType { get; set; }
    public string LeaveTypeName { get; set; } = string.Empty; // Auto-populated
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int RequestedDays { get; set; }
    public int? ApprovedDays { get; set; }
    
    // HR Balance Snapshot (simplified for list view)
    public decimal AvailableBalance { get; set; }
    
    public LeaveRequestStatusEnum Status { get; set; }
    public string StatusName { get; set; } = string.Empty; // Auto-populated

    public string? RequestNumber { get; set; }
    public bool IsInterrupted { get; set; }

    public DateTime? ApprovedAt { get; set; }
    public string? ApprovedByUserName { get; set; }

    public DateTime CreateAt { get; set; }
    public int StatusId { get; set; } // For StatusName auto-population
}



