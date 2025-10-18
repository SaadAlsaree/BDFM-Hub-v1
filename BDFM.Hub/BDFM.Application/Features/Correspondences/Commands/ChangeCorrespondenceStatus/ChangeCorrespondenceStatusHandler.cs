using BDFM.Application.Contracts.Identity;
using BDFM.Application.Contracts.SignalR;
using BDFM.Application.Services;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Commands.ChangeCorrespondenceStatus
{
    public class ChangeCorrespondenceStatusHandler : IRequestHandler<ChangeCorrespondenceStatusCommand, Response<bool>>
    {
        private readonly IBaseRepository<Correspondence> _correspondenceRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly ICorrespondenceNotificationService _correspondenceNotificationService;
        private readonly INotificationService _notificationService;
        private readonly ILogger<ChangeCorrespondenceStatusHandler> _logger;
        private readonly IAuditTrailService _auditTrailService;
        private readonly IBaseRepository<CorrespondenceTimeline> _correspondenceTimelineRepository;

        public ChangeCorrespondenceStatusHandler(
            IBaseRepository<Correspondence> correspondenceRepository,
            ICurrentUserService currentUserService,
            ICorrespondenceNotificationService correspondenceNotificationService,
            INotificationService notificationService,
            ILogger<ChangeCorrespondenceStatusHandler> logger,
            IAuditTrailService auditTrailService,
            IBaseRepository<CorrespondenceTimeline> correspondenceTimelineRepository)
        {
            _correspondenceRepository = correspondenceRepository;
            _currentUserService = currentUserService;
            _correspondenceNotificationService = correspondenceNotificationService;
            _notificationService = notificationService;
            _logger = logger;
            _auditTrailService = auditTrailService;
            _correspondenceTimelineRepository = correspondenceTimelineRepository;
        }

        public async Task<Response<bool>> Handle(ChangeCorrespondenceStatusCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // 1. Fetch Correspondence
                var correspondence = await _correspondenceRepository.Find(x => x.Id == request.CorrespondenceId);
                if (correspondence == null)
                {
                    return ErrorsMessage.NotFoundData.ToErrorMessage<bool>(false);
                }

                // Save original status for logging
                var originalStatus = correspondence.Status;

                // 2. Validate Status Change (add business rules as needed)
                // For example, you might not allow changing from Completed back to Draft
                // if (originalStatus == CorrespondenceStatusEnum.Completed && request.NewStatus == CorrespondenceStatusEnum.Draft)
                // {
                //     return Response<bool>.Fail("Cannot change status from Completed to Draft");
                // }

                // 3. Update Correspondence.Status
                correspondence.Status = request.NewStatus;
                correspondence.IsDraft = false;
                correspondence.CorrespondenceType = request.CorrespondenceType ?? correspondence.CorrespondenceType;
                correspondence.LastUpdateAt = DateTime.UtcNow;
                correspondence.LastUpdateBy = _currentUserService.UserId;

                // If cancelling, set IsDraft to false and clear any postponement
                if (request.NewStatus == CorrespondenceStatusEnum.Rejected)
                {
                    correspondence.IsDraft = false;
                }

                // If completing, set IsDraft to false and set FinalizedAt
                if (request.NewStatus == CorrespondenceStatusEnum.Completed)
                {
                    correspondence.IsDraft = false;
                    correspondence.FinalizedAt = DateTime.UtcNow;
                }

                // Update the correspondence
                _correspondenceRepository.Update(correspondence);

                // audit 
                await _auditTrailService.CreateCorrespondenceAuditLogWithChangesAsync(
                    "تحديث حالة الكتاب",
                    correspondence.Id,
                    oldValues: new { Status = originalStatus },
                    newValues: new { Status = request.NewStatus });

                try
                {
                    // Send real-time notification for general status change
                    await _correspondenceNotificationService.NotifyCorrespondenceStatusChangedAsync(
                        correspondence.Id,
                        originalStatus.GetDisplayName(),
                        request.NewStatus.GetDisplayName(),
                        _currentUserService.UserId);

                    // Send targeted notification to users who have enabled notifications for this correspondence
                    await _correspondenceNotificationService.NotifyCorrespondenceStatusChangedToUsersWithNotificationsAsync(
                        correspondence.Id,
                        request.NewStatus.GetDisplayName());

                    // Create persistent notifications for users who have enabled notifications
                    await _notificationService.CreateNotificationsForUsersWithCorrespondenceNotificationsAsync(
                        correspondence.Id,
                        $"Correspondence status changed to {request.NewStatus.GetDisplayName()}",
                        NotificationTypeEnum.StatusUpdate,
                        cancellationToken: cancellationToken);

                    // Send general inbox update
                    await _correspondenceNotificationService.NotifyInboxUpdateAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error sending notifications for correspondence status change {CorrespondenceId}", correspondence.Id);
                    // Don't fail the operation if notifications fail
                }

                _logger.LogInformation("Correspondence {CorrespondenceId} status changed from {OriginalStatus} to {NewStatus} by user {UserId}",
                    correspondence.Id, originalStatus, request.NewStatus, _currentUserService.UserId);

                return Response<bool>.Success(true, new MessageResponse
                {
                    Code = "Succeeded",
                    Message = $"Correspondence status changed to {request.NewStatus.GetDisplayName()} successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing correspondence status for correspondence {CorrespondenceId}", request.CorrespondenceId);
                return Response<bool>.Fail(
                    new List<object> { "An error occurred while changing the correspondence status" },
                    new MessageResponse { Code = "Error", Message = ex.Message });
            }
        }
    }
}
