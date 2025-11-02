using BDFM.Application.Contracts.Identity;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.LeaveRequests.Commands.RejectLeaveRequest;

public class RejectLeaveRequestHandler : IRequestHandler<RejectLeaveRequestCommand, Response<bool>>
{
    private readonly IBaseRepository<LeaveRequest> _leaveRequestRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<RejectLeaveRequestHandler> _logger;

    public RejectLeaveRequestHandler(
        IBaseRepository<LeaveRequest> leaveRequestRepository,
        ICurrentUserService currentUserService,
        ILogger<RejectLeaveRequestHandler> logger)
    {
        _leaveRequestRepository = leaveRequestRepository;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Response<bool>> Handle(RejectLeaveRequestCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Get leave request
            var leaveRequest = await _leaveRequestRepository.Find(
                x => x.Id == request.Id && !x.IsDeleted,
                cancellationToken: cancellationToken);

            if (leaveRequest == null)
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage(false);
            }

            // Check if can be rejected (only PendingApproval or Draft status)
            if (leaveRequest.Status != LeaveRequestStatusEnum.PendingApproval && leaveRequest.Status != LeaveRequestStatusEnum.Draft)
            {
                return Response<bool>.Fail(false, new MessageResponse
                {
                    Code = "INVALID_STATUS",
                    Message = "لا يمكن رفض طلب الإجازة في هذه الحالة"
                });
            }

            // Update leave request status
            leaveRequest.Status = LeaveRequestStatusEnum.Rejected;
            leaveRequest.RejectionReason = request.RejectionReason;
            leaveRequest.LastUpdateAt = DateTime.UtcNow;
            leaveRequest.LastUpdateBy = _currentUserService.UserId;

            var updateResult = _leaveRequestRepository.Update(leaveRequest);

            if (!updateResult)
            {
                return ErrorsMessage.FailOnUpdate.ToErrorMessage(false);
            }

            _logger.LogInformation("Leave request rejected successfully. RequestId: {RequestId}, EmployeeId: {EmployeeId}",
                leaveRequest.Id, leaveRequest.EmployeeId);

            return SuccessMessage.Update.ToSuccessMessage(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting leave request. RequestId: {RequestId}", request.Id);
            return Response<bool>.Fail(false, new MessageResponse
            {
                Code = "REJECT_ERROR",
                Message = "حدث خطأ أثناء رفض طلب الإجازة"
            });
        }
    }
}



