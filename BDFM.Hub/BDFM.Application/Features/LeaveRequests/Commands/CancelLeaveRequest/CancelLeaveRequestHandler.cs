using BDFM.Application.Contracts.Identity;
using BDFM.Application.Services;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.LeaveRequests.Commands.CancelLeaveRequest;

public class CancelLeaveRequestHandler : IRequestHandler<CancelLeaveRequestCommand, Response<bool>>
{
    private readonly IBaseRepository<LeaveRequest> _leaveRequestRepository;
    private readonly IBaseRepository<LeaveBalanceHistory> _leaveBalanceHistoryRepository;
    private readonly IBaseRepository<LeaveCancellation> _leaveCancellationRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IHRIntegrationService _hrIntegrationService;
    private readonly ILeaveRequestService _leaveRequestService;
    private readonly ILogger<CancelLeaveRequestHandler> _logger;

    public CancelLeaveRequestHandler(
        IBaseRepository<LeaveRequest> leaveRequestRepository,
        IBaseRepository<LeaveBalanceHistory> leaveBalanceHistoryRepository,
        IBaseRepository<LeaveCancellation> leaveCancellationRepository,
        ICurrentUserService currentUserService,
        IHRIntegrationService hrIntegrationService,
        ILeaveRequestService leaveRequestService,
        ILogger<CancelLeaveRequestHandler> logger)
    {
        _leaveRequestRepository = leaveRequestRepository;
        _leaveBalanceHistoryRepository = leaveBalanceHistoryRepository;
        _leaveCancellationRepository = leaveCancellationRepository;
        _currentUserService = currentUserService;
        _hrIntegrationService = hrIntegrationService;
        _leaveRequestService = leaveRequestService;
        _logger = logger;
    }

    public async Task<Response<bool>> Handle(CancelLeaveRequestCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // 1. Get leave request
            var leaveRequest = await _leaveRequestRepository.Find(
                x => x.Id == request.Id && !x.IsDeleted,
                cancellationToken: cancellationToken);

            if (leaveRequest == null)
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage(false);
            }

            // 2. Check if can be cancelled (only Approved status)
            if (!_leaveRequestService.CanCancelLeaveRequest(leaveRequest.Status))
            {
                return Response<bool>.Fail(false, new MessageResponse
                {
                    Code = "INVALID_STATUS",
                    Message = "لا يمكن إلغاء طلب الإجازة في هذه الحالة. يمكن إلغاء الطلبات المعتمدة فقط"
                });
            }

            // 3. Get approved days
            var approvedDays = leaveRequest.ApprovedDays ?? leaveRequest.RequestedDays;

            // 4. Calculate previous balance from snapshot
            var previousBalance = leaveRequest.LeaveType == LeaveTypeEnum.RegularDaily
                ? leaveRequest.MonthlyBalance - leaveRequest.MonthlyUsedBalance
                : leaveRequest.AvailableBalance;

            // 5. Calculate new balance after restoration
            decimal newBalance;
            if (leaveRequest.LeaveType == LeaveTypeEnum.RegularDaily)
            {
                // For regular daily: restore to monthly balance
                newBalance = (leaveRequest.MonthlyBalance - leaveRequest.MonthlyUsedBalance) + approvedDays;
            }
            else
            {
                // For other types: restore to total balance
                newBalance = leaveRequest.AvailableBalance + approvedDays;
            }

            // 6. Update balance in HR system via API
            var updateSuccess = await _hrIntegrationService.UpdateLeaveBalanceAsync(
                leaveRequest.EmployeeId,
                leaveRequest.LeaveType,
                approvedDays, // Positive because we're restoring
                $"إلغاء طلب إجازة رقم {leaveRequest.RequestNumber}",
                cancellationToken);

            if (!updateSuccess)
            {
                _logger.LogWarning("Failed to restore leave balance in HR system for EmployeeId: {EmployeeId}", leaveRequest.EmployeeId);
                // Continue anyway - record the cancellation locally
            }

            // 7. Record in balance history for audit trail
            var balanceHistory = new LeaveBalanceHistory
            {
                Id = Guid.NewGuid(),
                LeaveRequestId = leaveRequest.Id,
                EmployeeId = leaveRequest.EmployeeId,
                EmployeeNumber = leaveRequest.EmployeeNumber,
                LeaveType = leaveRequest.LeaveType,
                PreviousBalance = previousBalance,
                NewBalance = newBalance,
                ChangeAmount = approvedDays, // Positive because we're restoring
                ChangeReason = $"إلغاء طلب إجازة رقم {leaveRequest.RequestNumber}. {request.CancellationReason ?? string.Empty}",
                ChangedByUserId = _currentUserService.UserId,
                ChangeDate = DateTime.UtcNow,
                ChangeType = "Cancellation",
                CreateAt = DateTime.UtcNow,
                CreateBy = _currentUserService.UserId,
                StatusId = Status.Active
            };
            await _leaveBalanceHistoryRepository.Create(balanceHistory, cancellationToken);

            // 8. Record cancellation
            var cancellation = new LeaveCancellation
            {
                Id = Guid.NewGuid(),
                LeaveRequestId = leaveRequest.Id,
                CancellationDate = DateTime.UtcNow,
                CancelledByUserId = _currentUserService.UserId,
                EmployeeId = leaveRequest.EmployeeId,
                Reason = request.CancellationReason,
                IsBalanceRestored = updateSuccess,
                RestoredDays = approvedDays,
                CreateAt = DateTime.UtcNow,
                CreateBy = _currentUserService.UserId,
                StatusId = Status.Active
            };
            await _leaveCancellationRepository.Create(cancellation, cancellationToken);

            // 9. Update leave request status and snapshot
            leaveRequest.Status = LeaveRequestStatusEnum.Cancelled;
            leaveRequest.CancellationReason = request.CancellationReason;
            leaveRequest.CancelledAt = DateTime.UtcNow;
            leaveRequest.CancelledByUserId = _currentUserService.UserId;

            // Update snapshot balance (restore days)
            if (leaveRequest.LeaveType == LeaveTypeEnum.RegularDaily)
            {
                leaveRequest.MonthlyUsedBalance -= approvedDays;
                leaveRequest.UsedBalance -= approvedDays;
            }
            else
            {
                leaveRequest.UsedBalance -= approvedDays;
            }
            leaveRequest.AvailableBalance = leaveRequest.TotalBalance - leaveRequest.UsedBalance;

            leaveRequest.LastUpdateAt = DateTime.UtcNow;
            leaveRequest.LastUpdateBy = _currentUserService.UserId;

            var updateResult = _leaveRequestRepository.Update(leaveRequest);

            if (!updateResult)
            {
                return ErrorsMessage.FailOnUpdate.ToErrorMessage(false);
            }

            _logger.LogInformation("Leave request cancelled successfully. RequestId: {RequestId}, EmployeeId: {EmployeeId}, RestoredDays: {RestoredDays}",
                leaveRequest.Id, leaveRequest.EmployeeId, approvedDays);

            return SuccessMessage.Update.ToSuccessMessage(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling leave request. RequestId: {RequestId}", request.Id);
            return Response<bool>.Fail(false, new MessageResponse
            {
                Code = "CANCEL_ERROR",
                Message = "حدث خطأ أثناء إلغاء طلب الإجازة"
            });
        }
    }
}



