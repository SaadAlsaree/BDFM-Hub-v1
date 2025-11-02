using BDFM.Application.Features.Utility.BaseUtility.Command.Update;
using BDFM.Application.Services;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.LeaveRequests.Commands.UpdateLeaveRequest;

public class UpdateLeaveRequestHandler : UpdateHandler<LeaveRequest, UpdateLeaveRequestCommand>,
    IRequestHandler<UpdateLeaveRequestCommand, Response<bool>>
{
    private readonly ILeaveRequestService _leaveRequestService;
    private readonly IBaseRepository<LeaveRequest> _leaveRequestRepository;
    private readonly ILogger<UpdateLeaveRequestHandler> _logger;

    public UpdateLeaveRequestHandler(
        IBaseRepository<LeaveRequest> repository,
        ILeaveRequestService leaveRequestService,
        ILogger<UpdateLeaveRequestHandler> logger)
        : base(repository)
    {
        _leaveRequestService = leaveRequestService;
        _leaveRequestRepository = repository;
        _logger = logger;
    }

    public override Expression<Func<LeaveRequest, bool>> EntityPredicate(UpdateLeaveRequestCommand request)
    {
        return x => x.Id == request.Id && !x.IsDeleted;
    }

    public async Task<Response<bool>> Handle(UpdateLeaveRequestCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Get existing leave request
            var existingRequest = await _leaveRequestRepository.Find(
                x => x.Id == request.Id && !x.IsDeleted,
                cancellationToken: cancellationToken);

            if (existingRequest == null)
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage(false);
            }

            // Check if can be updated (only Draft or PendingApproval status)
            if (!_leaveRequestService.CanUpdateLeaveRequest(existingRequest.Status))
            {
                return Response<bool>.Fail(false, new MessageResponse
                {
                    Code = "INVALID_STATUS",
                    Message = "لا يمكن تحديث طلب الإجازة في هذه الحالة"
                });
            }

            // If dates are being updated, recalculate requested days
            if (request.StartDate.HasValue || request.EndDate.HasValue)
            {
                var startDate = request.StartDate ?? existingRequest.StartDate;
                var endDate = request.EndDate ?? existingRequest.EndDate;

                if (endDate < startDate)
                {
                    return Response<bool>.Fail(false, new MessageResponse
                    {
                        Code = "INVALID_DATES",
                        Message = "تاريخ نهاية الإجازة يجب أن يكون بعد تاريخ البداية"
                    });
                }

                var newRequestedDays = _leaveRequestService.CalculateRequestedDays(startDate, endDate);

                // Validate new balance
                var (isValid, errorMessage) = await _leaveRequestService.ValidateLeaveBalanceAsync(
                    existingRequest.EmployeeId, 
                    request.LeaveType ?? existingRequest.LeaveType, 
                    newRequestedDays, 
                    cancellationToken);

                if (!isValid)
                {
                    return Response<bool>.Fail(false, new MessageResponse
                    {
                        Code = "INSUFFICIENT_BALANCE",
                        Message = errorMessage ?? "الرصيد غير كافي"
                    });
                }

                // Update requested days in the command
                // Note: UpdateHandler passes entire command object, so we need to handle this differently
                // For now, we'll do custom update
                existingRequest.StartDate = startDate;
                existingRequest.EndDate = endDate;
                existingRequest.RequestedDays = newRequestedDays;

                if (request.LeaveType.HasValue)
                {
                    existingRequest.LeaveType = request.LeaveType.Value;
                }

                if (request.Reason != null)
                {
                    existingRequest.Reason = request.Reason;
                }

                existingRequest.LastUpdateAt = DateTime.UtcNow;

                var updateResult = _leaveRequestRepository.Update(existingRequest);
                if (!updateResult)
                {
                    return ErrorsMessage.FailOnUpdate.ToErrorMessage(false);
                }

                _logger.LogInformation("Leave request updated successfully. RequestId: {RequestId}", request.Id);
                return SuccessMessage.Update.ToSuccessMessage(true);
            }
            else
            {
                // Use base handler for other fields
                return await HandleBase(request, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating leave request. RequestId: {RequestId}", request.Id);
            return Response<bool>.Fail(false, new MessageResponse
            {
                Code = "UPDATE_ERROR",
                Message = "حدث خطأ أثناء تحديث طلب الإجازة"
            });
        }
    }
}



