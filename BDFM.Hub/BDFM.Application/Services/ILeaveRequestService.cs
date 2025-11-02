using BDFM.Application.Contracts.Persistence;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Services;

/// <summary>
/// Service for leave request business logic
/// </summary>
public interface ILeaveRequestService
{
    /// <summary>
    /// Calculates the number of days requested between start and end dates
    /// </summary>
    int CalculateRequestedDays(DateTime startDate, DateTime endDate);

    /// <summary>
    /// Validates if employee has sufficient leave balance
    /// </summary>
    Task<(bool IsValid, string? ErrorMessage)> ValidateLeaveBalanceAsync(string employeeId, LeaveTypeEnum leaveType, int requestedDays, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks user rights for approving leave requests
    /// Returns the maximum additional days the user can approve beyond employee's monthly entitlement
    /// </summary>
    Task<int> GetMaxAdditionalDaysAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates a unique request number for leave request
    /// </summary>
    Task<string> GenerateRequestNumberAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Calculates actual days used from interruption date to return date
    /// </summary>
    int CalculateActualDaysUsed(DateTime startDate, DateTime interruptionDate);

    /// <summary>
    /// Checks if leave request can be updated (only Draft or PendingApproval status)
    /// </summary>
    bool CanUpdateLeaveRequest(LeaveRequestStatusEnum currentStatus);

    /// <summary>
    /// Checks if leave request can be cancelled (only Approved status)
    /// </summary>
    bool CanCancelLeaveRequest(LeaveRequestStatusEnum currentStatus);

    /// <summary>
    /// Checks if leave request can be interrupted (only Approved status)
    /// </summary>
    bool CanInterruptLeaveRequest(LeaveRequestStatusEnum currentStatus);
}



