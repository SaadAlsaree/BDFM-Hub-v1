namespace BDFM.Application.Services;

/// <summary>
/// Service for integrating with HR system to update leave balances
/// Note: Getting employee data and balances is done in frontend, not through this service
/// </summary>
public interface IHRIntegrationService
{
    /// <summary>
    /// Updates leave balance in HR system
    /// </summary>
    /// <param name="employeeId">Employee ID from HR system</param>
    /// <param name="leaveType">Type of leave</param>
    /// <param name="changeAmount">Amount to change (positive for addition/restoration, negative for deduction)</param>
    /// <param name="reason">Reason for the change</param>
    /// <returns>True if update was successful</returns>
    Task<bool> UpdateLeaveBalanceAsync(string employeeId, LeaveTypeEnum leaveType, decimal changeAmount, string reason, CancellationToken cancellationToken = default);
}

/// <summary>
/// DTO for employee data from HR system
/// </summary>
public class EmployeeDataDto
{
    public string EmployeeId { get; set; } = string.Empty;
    public string? EmployeeNumber { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public Guid? OrganizationalUnitId { get; set; }
    public string? OrganizationalUnitName { get; set; }
    public string? PositionTitle { get; set; }
    public bool IsActive { get; set; }
}

/// <summary>
/// DTO for leave balance data from HR system
/// </summary>
public class LeaveBalanceDto
{
    public string EmployeeId { get; set; } = string.Empty;
    public LeaveTypeEnum LeaveType { get; set; }
    public decimal TotalBalance { get; set; }
    public DateTime? LastSyncDate { get; set; }
}



