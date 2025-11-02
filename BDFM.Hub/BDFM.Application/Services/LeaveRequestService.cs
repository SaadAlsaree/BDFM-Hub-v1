using BDFM.Application.Contracts.Persistence;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Services;

/// <summary>
/// Implementation of Leave Request Service
/// </summary>
public class LeaveRequestService : ILeaveRequestService
{
    private readonly IBaseRepository<LeaveRequest> _leaveRequestRepository;
    private readonly IBaseRepository<User> _userRepository;
    private readonly ILogger<LeaveRequestService> _logger;

    public LeaveRequestService(
        IBaseRepository<LeaveRequest> leaveRequestRepository,
        IBaseRepository<User> userRepository,
        ILogger<LeaveRequestService> logger)
    {
        _leaveRequestRepository = leaveRequestRepository;
        _userRepository = userRepository;
        _logger = logger;
    }

    public int CalculateRequestedDays(DateTime startDate, DateTime endDate)
    {
        if (endDate < startDate)
            return 0;

        // Calculate business days (excluding weekends)
        // For simplicity, using total days. In production, you might want to exclude weekends/holidays
        var days = (endDate.Date - startDate.Date).Days + 1; // +1 to include both start and end dates
        return days;
    }

    public async Task<(bool IsValid, string? ErrorMessage)> ValidateLeaveBalanceAsync(string employeeId, LeaveTypeEnum leaveType, int requestedDays, CancellationToken cancellationToken = default)
    {
        // This method is now deprecated - validation is done in frontend
        // Keeping for backward compatibility, but it always returns true
        // The actual validation should be done using the balance snapshot in LeaveRequest
        
        _logger.LogWarning("ValidateLeaveBalanceAsync is deprecated. Validation should be done in frontend using HR data.");
        
        return (true, null);
    }

    public async Task<int> GetMaxAdditionalDaysAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        // Check user roles to determine max additional days
        var user = await _userRepository.Find(
            x => x.Id == userId,
            include: query => query.Include(u => u.UserRoles).ThenInclude(ur => ur.Role),
            cancellationToken: cancellationToken);

        if (user == null)
            return 0;

        // Check if user is General Manager (5 days)
        if (user.UserRoles.Any(ur => ur.Role != null && ur.Role.Name.Contains("مدير عام", StringComparison.OrdinalIgnoreCase)))
        {
            return 5;
        }

        // Check if user is Manager (2 days)
        if (user.UserRoles.Any(ur => ur.Role != null && ur.Role.Name.Contains("مدير", StringComparison.OrdinalIgnoreCase)))
        {
            return 2;
        }

        // Regular employee (0 additional days - uses only monthly balance)
        return 0;
    }

    public async Task<string> GenerateRequestNumberAsync(CancellationToken cancellationToken = default)
    {
        var year = DateTime.UtcNow.Year;
        var prefix = "LEAVE";

        // Get the last request number for this year
        var lastRequest = await _leaveRequestRepository.Find(
            x => x.RequestNumber != null && x.RequestNumber.StartsWith($"{prefix}-{year}"),
            orderBy: query => query.OrderByDescending(x => x.RequestNumber),
            cancellationToken: cancellationToken);

        int sequenceNumber = 1;
        if (lastRequest != null && !string.IsNullOrEmpty(lastRequest.RequestNumber))
        {
            // Extract sequence number from last request (format: LEAVE-2025-001)
            var parts = lastRequest.RequestNumber.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out int lastSequence))
            {
                sequenceNumber = lastSequence + 1;
            }
        }

        return $"{prefix}-{year}-{sequenceNumber:D3}";
    }

    public int CalculateActualDaysUsed(DateTime startDate, DateTime interruptionDate)
    {
        if (interruptionDate < startDate)
            return 0;

        var days = (interruptionDate.Date - startDate.Date).Days + 1; // +1 to include start date
        return days;
    }

    public bool CanUpdateLeaveRequest(LeaveRequestStatusEnum currentStatus)
    {
        return currentStatus == LeaveRequestStatusEnum.Draft || currentStatus == LeaveRequestStatusEnum.PendingApproval;
    }

    public bool CanCancelLeaveRequest(LeaveRequestStatusEnum currentStatus)
    {
        return currentStatus == LeaveRequestStatusEnum.Approved;
    }

    public bool CanInterruptLeaveRequest(LeaveRequestStatusEnum currentStatus)
    {
        return currentStatus == LeaveRequestStatusEnum.Approved;
    }
}

