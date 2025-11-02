using BDFM.Application.Contracts.Identity;
using BDFM.Application.Services;
using BDFM.Domain.Entities.Core;
using Microsoft.EntityFrameworkCore;

namespace BDFM.Application.Features.LeaveRequests.Commands.CreateLeaveRequest;

public class CreateLeaveRequestHandler : IRequestHandler<CreateLeaveRequestCommand, Response<Guid>>
{
    private readonly IBaseRepository<LeaveRequest> _repository;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILeaveRequestService _leaveRequestService;
    private readonly ILogger<CreateLeaveRequestHandler> _logger;

    public CreateLeaveRequestHandler(
        IBaseRepository<LeaveRequest> repository,
        ICurrentUserService currentUserService,
        ILeaveRequestService leaveRequestService,
        ILogger<CreateLeaveRequestHandler> logger)
    {
        _repository = repository;
        _currentUserService = currentUserService;
        _leaveRequestService = leaveRequestService;
        _logger = logger;
    }

    public async Task<Response<Guid>> Handle(CreateLeaveRequestCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // 1. Calculate requested days
            var requestedDays = _leaveRequestService.CalculateRequestedDays(request.StartDate, request.EndDate);
            if (requestedDays <= 0)
            {
                return Response<Guid>.Fail(Guid.Empty, new MessageResponse
                {
                    Code = "INVALID_DAYS",
                    Message = "عدد الأيام المطلوبة غير صحيح"
                });
            }

            // 2. Basic validation - check if requested days exceed available balance
            if (request.LeaveType == LeaveTypeEnum.RegularDaily)
            {
                var availableMonthlyBalance = request.MonthlyBalance - request.MonthlyUsedBalance;
                if (requestedDays > availableMonthlyBalance)
                {
                    return Response<Guid>.Fail(Guid.Empty, new MessageResponse
                    {
                        Code = "INSUFFICIENT_BALANCE",
                        Message = $"الرصيد الشهري غير كافي. المتاح: {availableMonthlyBalance} يوم، المطلوب: {requestedDays} يوم"
                    });
                }
            }
            else
            {
                if (requestedDays > request.AvailableBalance)
                {
                    return Response<Guid>.Fail(Guid.Empty, new MessageResponse
                    {
                        Code = "INSUFFICIENT_BALANCE",
                        Message = $"الرصيد الكلي غير كافي. المتاح: {request.AvailableBalance} يوم، المطلوب: {requestedDays} يوم"
                    });
                }
            }

            // 3. Generate request number
            var requestNumber = await _leaveRequestService.GenerateRequestNumberAsync(cancellationToken);

            // 4. Create leave request entity with HR data snapshot
            var leaveRequest = new LeaveRequest
            {
                Id = Guid.NewGuid(),
                EmployeeId = request.EmployeeId,
                EmployeeNumber = request.EmployeeNumber,
                EmployeeName = request.EmployeeName,
                OrganizationalUnitId = request.OrganizationalUnitId,
                CreatedByUserId = _currentUserService.UserId,
                LeaveType = request.LeaveType,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                RequestedDays = requestedDays,
                // HR Balance Snapshot (from frontend)
                TotalBalance = request.TotalBalance,
                MonthlyBalance = request.MonthlyBalance,
                UsedBalance = request.UsedBalance,
                AvailableBalance = request.AvailableBalance,
                MonthlyUsedBalance = request.MonthlyUsedBalance,
                LastMonthlyResetDate = request.LastMonthlyResetDate,
                // Request data
                Status = LeaveRequestStatusEnum.Draft,
                Reason = request.Reason,
                RequestNumber = requestNumber,
                CreateAt = DateTime.UtcNow,
                CreateBy = _currentUserService.UserId,
                StatusId = Status.Unverified,
                IsDeleted = false
            };

            // 6. Save to database
            var result = await _repository.Create(leaveRequest, cancellationToken);

            if (result == null)
            {
                return ErrorsMessage.FailOnCreate.ToErrorMessage<Guid>(Guid.Empty);
            }

            _logger.LogInformation("Leave request created successfully. RequestId: {RequestId}, EmployeeId: {EmployeeId}, RequestNumber: {RequestNumber}",
                leaveRequest.Id, request.EmployeeId, requestNumber);

            return SuccessMessage.Create.ToSuccessMessage(leaveRequest.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating leave request for EmployeeId: {EmployeeId}", request.EmployeeId);
            return Response<Guid>.Fail(Guid.Empty, new MessageResponse
            {
                Code = "CREATE_ERROR",
                Message = "حدث خطأ أثناء إنشاء طلب الإجازة"
            });
        }
    }
}

