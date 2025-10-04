using BDFM.Application.Contracts.Identity;
using BDFM.Application.Contracts.SignalR;
using BDFM.Domain.Entities.Core;
using BDFM.Application.Services;

namespace BDFM.Application.Features.Correspondences.Commands.PermanentlyDeleteCorrespondence
{
    public class PermanentlyDeleteCorrespondenceHandler : IRequestHandler<PermanentlyDeleteCorrespondenceCommand, Response<bool>>
    {
        private readonly IBaseRepository<Correspondence> _correspondenceRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly ICorrespondenceNotificationService _notificationService;
        private readonly ILogger<PermanentlyDeleteCorrespondenceHandler> _logger;
        private readonly IAuditTrailService _auditTrailService;

        public PermanentlyDeleteCorrespondenceHandler(
            IBaseRepository<Correspondence> correspondenceRepository,
            ICurrentUserService currentUserService,
            ICorrespondenceNotificationService notificationService,
            ILogger<PermanentlyDeleteCorrespondenceHandler> logger,
            IAuditTrailService auditTrailService)
        {
            _correspondenceRepository = correspondenceRepository;
            _currentUserService = currentUserService;
            _notificationService = notificationService;
            _logger = logger;
            _auditTrailService = auditTrailService;
        }

        public async Task<Response<bool>> Handle(PermanentlyDeleteCorrespondenceCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Find the correspondence
                var correspondence = await _correspondenceRepository.Find(x => x.Id == request.CorrespondenceId);
                if (correspondence == null)
                {
                    return ErrorsMessage.NotFoundData.ToErrorMessage<bool>(false);
                }

                // Check if user has permission to delete this correspondence
                // This might need additional authorization logic based on your business rules

                // Delete the correspondence
                await _correspondenceRepository.Delete(correspondence, cancellationToken);

                // Send real-time notification
                await _notificationService.NotifyCorrespondenceDeletedAsync(correspondence.Id);
                await _notificationService.NotifyInboxUpdateAsync();

                _logger.LogInformation("Correspondence {CorrespondenceId} permanently deleted by user {UserId}",
                    correspondence.Id, _currentUserService.UserId);

                await _auditTrailService.CreateAuditLogAsync(
                    "حذف كتاب نهائيا",
                    "الكتاب",
                    correspondence.Id,
                    _currentUserService.UserId,
                    $"تم حذف كتاب برقم {correspondence.MailNum} نهائيا",
                    "127.0.0.1");

                return Response<bool>.Success(true, new MessageResponse { Code = "Succeeded", Message = "Correspondence permanently deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error permanently deleting correspondence {CorrespondenceId}", request.CorrespondenceId);
                return Response<bool>.Fail(
                    new List<object> { "An error occurred while permanently deleting the correspondence" },
                    new MessageResponse { Code = "Error", Message = ex.Message });
            }
        }
    }
}
