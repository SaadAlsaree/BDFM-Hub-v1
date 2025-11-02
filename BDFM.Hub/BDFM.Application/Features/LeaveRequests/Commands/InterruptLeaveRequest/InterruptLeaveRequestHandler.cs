using BDFM.Application.Contracts.Identity;
using BDFM.Application.Services;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.LeaveRequests.Commands.InterruptLeaveRequest;

public class InterruptLeaveRequestHandler : IRequestHandler<InterruptLeaveRequestCommand, Response<bool>>
{
    private readonly IBaseRepository<LeaveRequest> _leaveRequestRepository;
    private readonly IBaseRepository<LeaveBalanceHistory> _leaveBalanceHistoryRepository;
    private readonly IBaseRepository<LeaveInterruption> _leaveInterruptionRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IHRIntegrationService _hrIntegrationService;
    private readonly ILeaveRequestService _leaveRequestService;
    private readonly ILogger<InterruptLeaveRequestHandler> _logger;

    public InterruptLeaveRequestHandler(
        IBaseRepository<LeaveRequest> leaveRequestRepository,
        IBaseRepository<LeaveBalanceHistory> leaveBalanceHistoryRepository,
        IBaseRepository<LeaveInterruption> leaveInterruptionRepository,
        ICurrentUserService currentUserService,
        IHRIntegrationService hrIntegrationService,
        ILeaveRequestService leaveRequestService,
        ILogger<InterruptLeaveRequestHandler> logger)
    {
        _leaveRequestRepository = leaveRequestRepository;
        _leaveBalanceHistoryRepository = leaveBalanceHistoryRepository;
        _leaveInterruptionRepository = leaveInterruptionRepository;
        _currentUserService = currentUserService;
        _hrIntegrationService = hrIntegrationService;
        _leaveRequestService = leaveRequestService;
        _logger = logger;
    }

    public async Task<Response<bool>> Handle(InterruptLeaveRequestCommand request, CancellationToken cancellationToken)
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

            // 2. Check if can be interrupted (only Approved status)
            if (!_leaveRequestService.CanInterruptLeaveRequest(leaveRequest.Status))
            {
                return Response<bool>.Fail(false, new MessageResponse
                {
                    Code = "INVALID_STATUS",
                    Message = "لا يمكن قطع طلب الإجازة في هذه الحالة. يمكن قطع الطلبات المعتمدة فقط"
                });
            }

            // 3. Validate interruption date is within leave period
            if (request.InterruptionDate < leaveRequest.StartDate || request.InterruptionDate > leaveRequest.EndDate)
            {
                return Response<bool>.Fail(false, new MessageResponse
                {
                    Code = "INVALID_INTERRUPTION_DATE",
                    Message = "تاريخ قطع الإجازة يجب أن يكون ضمن فترة الإجازة"
                });
            }

            // 4. Calculate actual days used
            var actualDaysUsed = _leaveRequestService.CalculateActualDaysUsed(leaveRequest.StartDate, request.InterruptionDate);

            // 5. Calculate days to restore
            var approvedDays = leaveRequest.ApprovedDays ?? leaveRequest.RequestedDays;
            var daysToRestore = approvedDays - actualDaysUsed;

            if (daysToRestore <= 0)
            {
                return Response<bool>.Fail(false, new MessageResponse
                {
                    Code = "INVALID_RESTORATION",
                    Message = "لا يوجد أيام للاسترجاع"
                });
            }

            // 6. Calculate previous balance from snapshot
            var previousBalance = leaveRequest.LeaveType == LeaveTypeEnum.RegularDaily
                ? leaveRequest.MonthlyBalance - leaveRequest.MonthlyUsedBalance
                : leaveRequest.AvailableBalance;

            // 7. Calculate new balance after restoration
            decimal newBalance;
            if (leaveRequest.LeaveType == LeaveTypeEnum.RegularDaily)
            {
                // For regular daily: restore to monthly balance
                newBalance = (leaveRequest.MonthlyBalance - leaveRequest.MonthlyUsedBalance) + daysToRestore;
            }
            else
            {
                // For other types: restore to total balance
                newBalance = leaveRequest.AvailableBalance + daysToRestore;
            }

            // 8. Update balance in HR system via API
            var updateSuccess = await _hrIntegrationService.UpdateLeaveBalanceAsync(
                leaveRequest.EmployeeId,
                leaveRequest.LeaveType,
                daysToRestore, // Positive because we're restoring
                $"قطع إجازة رقم {leaveRequest.RequestNumber}",
                cancellationToken);

            if (!updateSuccess)
            {
                _logger.LogWarning("Failed to restore leave balance in HR system for EmployeeId: {EmployeeId}", leaveRequest.EmployeeId);
                // Continue anyway - record the interruption locally
            }

            // 9. Record in balance history for audit trail
            var balanceHistory = new LeaveBalanceHistory
            {
                Id = Guid.NewGuid(),
                LeaveRequestId = leaveRequest.Id,
                EmployeeId = leaveRequest.EmployeeId,
                EmployeeNumber = leaveRequest.EmployeeNumber,
                LeaveType = leaveRequest.LeaveType,
                PreviousBalance = previousBalance,
                NewBalance = newBalance,
                ChangeAmount = daysToRestore, // Positive because we're restoring
                ChangeReason = $"قطع إجازة رقم {leaveRequest.RequestNumber}. الأيام الفعلية المستخدمة: {actualDaysUsed}، الأيام المسترجعة: {daysToRestore}. {request.Reason ?? string.Empty}",
                ChangedByUserId = _currentUserService.UserId,
                ChangeDate = DateTime.UtcNow,
                ChangeType = "Interruption",
                CreateAt = DateTime.UtcNow,
                CreateBy = _currentUserService.UserId,
                StatusId = Status.Active
            };
            await _leaveBalanceHistoryRepository.Create(balanceHistory, cancellationToken);

            // 10. Record interruption
            var interruption = new LeaveInterruption
            {
                Id = Guid.NewGuid(),
                LeaveRequestId = leaveRequest.Id,
                InterruptionDate = request.InterruptionDate,
                ReturnDate = request.ReturnDate,
                InterruptionType = request.InterruptionType,
                Reason = request.Reason,
                InterruptedByUserId = _currentUserService.UserId,
                EmployeeId = leaveRequest.EmployeeId,
                IsProcessed = true,
                AdjustedDays = daysToRestore,
                CreateAt = DateTime.UtcNow,
                CreateBy = _currentUserService.UserId,
                StatusId = Status.Active
            };
            await _leaveInterruptionRepository.Create(interruption, cancellationToken);

            // 11. Update leave request status and snapshot
            leaveRequest.Status = LeaveRequestStatusEnum.Interrupted;
            leaveRequest.IsInterrupted = true;
            leaveRequest.ActualEndDate = request.InterruptionDate;
            
            // Update snapshot balance (restore days)
            if (leaveRequest.LeaveType == LeaveTypeEnum.RegularDaily)
            {
                leaveRequest.MonthlyUsedBalance -= daysToRestore;
                leaveRequest.UsedBalance -= daysToRestore;
            }
            else
            {
                leaveRequest.UsedBalance -= daysToRestore;
            }
            leaveRequest.AvailableBalance = leaveRequest.TotalBalance - leaveRequest.UsedBalance;
            
            leaveRequest.LastUpdateAt = DateTime.UtcNow;
            leaveRequest.LastUpdateBy = _currentUserService.UserId;

            var updateResult = _leaveRequestRepository.Update(leaveRequest);

            if (!updateResult)
            {
                return ErrorsMessage.FailOnUpdate.ToErrorMessage(false);
            }

            _logger.LogInformation("Leave request interrupted successfully. RequestId: {RequestId}, EmployeeId: {EmployeeId}, ActualDaysUsed: {ActualDaysUsed}, RestoredDays: {RestoredDays}",
                leaveRequest.Id, leaveRequest.EmployeeId, actualDaysUsed, daysToRestore);

            return SuccessMessage.Update.ToSuccessMessage(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error interrupting leave request. RequestId: {RequestId}", request.Id);
            return Response<bool>.Fail(false, new MessageResponse
            {
                Code = "INTERRUPT_ERROR",
                Message = "حدث خطأ أثناء قطع طلب الإجازة"
            });
        }
    }
}



