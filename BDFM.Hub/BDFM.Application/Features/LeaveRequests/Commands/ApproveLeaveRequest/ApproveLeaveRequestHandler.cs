using BDFM.Application.Contracts.Identity;
using BDFM.Application.Services;
using BDFM.Domain.Entities.Core;
using Microsoft.EntityFrameworkCore;

namespace BDFM.Application.Features.LeaveRequests.Commands.ApproveLeaveRequest;

public class ApproveLeaveRequestHandler : IRequestHandler<ApproveLeaveRequestCommand, Response<bool>>
{
    private readonly IBaseRepository<LeaveRequest> _leaveRequestRepository;
    private readonly IBaseRepository<LeaveBalanceHistory> _leaveBalanceHistoryRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IHRIntegrationService _hrIntegrationService;
    private readonly ILeaveRequestService _leaveRequestService;
    private readonly ILogger<ApproveLeaveRequestHandler> _logger;

    public ApproveLeaveRequestHandler(
        IBaseRepository<LeaveRequest> leaveRequestRepository,
        IBaseRepository<LeaveBalanceHistory> leaveBalanceHistoryRepository,
        ICurrentUserService currentUserService,
        IHRIntegrationService hrIntegrationService,
        ILeaveRequestService leaveRequestService,
        ILogger<ApproveLeaveRequestHandler> logger)
    {
        _leaveRequestRepository = leaveRequestRepository;
        _leaveBalanceHistoryRepository = leaveBalanceHistoryRepository;
        _currentUserService = currentUserService;
        _hrIntegrationService = hrIntegrationService;
        _leaveRequestService = leaveRequestService;
        _logger = logger;
    }

    public async Task<Response<bool>> Handle(ApproveLeaveRequestCommand request, CancellationToken cancellationToken)
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

            // 2. Check if can be approved (only PendingApproval or Draft status)
            if (leaveRequest.Status != LeaveRequestStatusEnum.PendingApproval && leaveRequest.Status != LeaveRequestStatusEnum.Draft)
            {
                return Response<bool>.Fail(false, new MessageResponse
                {
                    Code = "INVALID_STATUS",
                    Message = "لا يمكن الموافقة على طلب الإجازة في هذه الحالة"
                });
            }

            // 3. Get max additional days for current user (0 for employee, +2 for manager, +5 for general manager)
            var maxAdditionalDays = await _leaveRequestService.GetMaxAdditionalDaysAsync(_currentUserService.UserId, cancellationToken);
            var approvedDays = request.ApprovedDays ?? leaveRequest.RequestedDays;

            // 4. Validate approved days against snapshot balance and rights
            if (leaveRequest.LeaveType == LeaveTypeEnum.RegularDaily)
            {
                var availableMonthlyBalance = leaveRequest.MonthlyBalance - leaveRequest.MonthlyUsedBalance;
                if (approvedDays > availableMonthlyBalance + maxAdditionalDays)
                {
                    return Response<bool>.Fail(false, new MessageResponse
                    {
                        Code = "EXCEEDS_RIGHTS",
                        Message = $"عدد الأيام المعتمدة ({approvedDays}) يتجاوز الرصيد المتاح ({availableMonthlyBalance}) بالإضافة إلى الحقوق الإضافية ({maxAdditionalDays} يوم)"
                    });
                }
            }
            else
            {
                if (approvedDays > leaveRequest.AvailableBalance + maxAdditionalDays)
                {
                    return Response<bool>.Fail(false, new MessageResponse
                    {
                        Code = "EXCEEDS_RIGHTS",
                        Message = $"عدد الأيام المعتمدة ({approvedDays}) يتجاوز الرصيد المتاح ({leaveRequest.AvailableBalance}) بالإضافة إلى الحقوق الإضافية ({maxAdditionalDays} يوم)"
                    });
                }
            }

            // 5. Calculate previous balance from snapshot
            var previousBalance = leaveRequest.LeaveType == LeaveTypeEnum.RegularDaily
                ? leaveRequest.MonthlyBalance - leaveRequest.MonthlyUsedBalance
                : leaveRequest.AvailableBalance;

            // 6. Calculate new balance after approval
            decimal newBalance;
            if (leaveRequest.LeaveType == LeaveTypeEnum.RegularDaily)
            {
                // For regular daily: deduct from monthly balance
                newBalance = (leaveRequest.MonthlyBalance - leaveRequest.MonthlyUsedBalance) - approvedDays;
            }
            else
            {
                // For other types: deduct from total balance
                newBalance = leaveRequest.AvailableBalance - approvedDays;
            }

            // 7. Update leave balance in HR system via API
            var updateSuccess = await _hrIntegrationService.UpdateLeaveBalanceAsync(
                leaveRequest.EmployeeId,
                leaveRequest.LeaveType,
                -approvedDays, // Negative because we're deducting
                $"موافقة على طلب إجازة رقم {leaveRequest.RequestNumber}",
                cancellationToken);

            if (!updateSuccess)
            {
                _logger.LogWarning("Failed to update leave balance in HR system for EmployeeId: {EmployeeId}", leaveRequest.EmployeeId);
                // Continue anyway - record the approval locally
            }

            // 8. Record in balance history for audit trail
            var balanceHistory = new LeaveBalanceHistory
            {
                Id = Guid.NewGuid(),
                LeaveRequestId = leaveRequest.Id,
                EmployeeId = leaveRequest.EmployeeId,
                EmployeeNumber = leaveRequest.EmployeeNumber,
                LeaveType = leaveRequest.LeaveType,
                PreviousBalance = previousBalance,
                NewBalance = newBalance,
                ChangeAmount = -approvedDays,
                ChangeReason = $"موافقة على طلب إجازة رقم {leaveRequest.RequestNumber}. {request.Notes ?? string.Empty}",
                ChangedByUserId = _currentUserService.UserId,
                ChangeDate = DateTime.UtcNow,
                ChangeType = "Approval",
                CreateAt = DateTime.UtcNow,
                CreateBy = _currentUserService.UserId,
                StatusId = Status.Active
            };
            await _leaveBalanceHistoryRepository.Create(balanceHistory, cancellationToken);

            // 9. Update leave request status and snapshot
            leaveRequest.Status = LeaveRequestStatusEnum.Approved;
            leaveRequest.ApprovedDays = approvedDays;
            leaveRequest.ApprovedAt = DateTime.UtcNow;
            leaveRequest.ApprovedByUserId = _currentUserService.UserId;

            // Update snapshot balance (for audit - reflects the state after approval)
            if (leaveRequest.LeaveType == LeaveTypeEnum.RegularDaily)
            {
                leaveRequest.MonthlyUsedBalance += approvedDays;
                leaveRequest.UsedBalance += approvedDays;
            }
            else
            {
                leaveRequest.UsedBalance += approvedDays;
            }
            leaveRequest.AvailableBalance = leaveRequest.TotalBalance - leaveRequest.UsedBalance;

            leaveRequest.LastUpdateAt = DateTime.UtcNow;
            leaveRequest.LastUpdateBy = _currentUserService.UserId;

            var updateResult = _leaveRequestRepository.Update(leaveRequest);

            if (!updateResult)
            {
                return ErrorsMessage.FailOnUpdate.ToErrorMessage(false);
            }

            _logger.LogInformation("Leave request approved successfully. RequestId: {RequestId}, EmployeeId: {EmployeeId}, ApprovedDays: {ApprovedDays}",
                leaveRequest.Id, leaveRequest.EmployeeId, approvedDays);

            // TODO: Trigger LeaveWorkflow if exists

            return SuccessMessage.Update.ToSuccessMessage(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving leave request. RequestId: {RequestId}", request.Id);
            return Response<bool>.Fail(false, new MessageResponse
            {
                Code = "APPROVE_ERROR",
                Message = "حدث خطأ أثناء الموافقة على طلب الإجازة"
            });
        }
    }
}

