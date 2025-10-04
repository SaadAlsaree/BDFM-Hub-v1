
using BDFM.Application.Contracts.Identity;
using BDFM.Application.Contracts.SignalR;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Common;
using BDFM.Application.Services;

namespace BDFM.Application.Features.Correspondences.Commands.UpdateCorrespondenceContent
{
    // This handler leverages the UpdateHandler from BaseUtility
    public class UpdateCorrespondenceContentHandler : IRequestHandler<UpdateCorrespondenceContentCommand, Response<bool>>
    {
        private readonly IBaseRepository<Correspondence> _correspondenceRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IBaseRepository<User> _userRepository;
        private readonly ICorrespondenceNotificationService _notificationService;
        private readonly IAuditTrailService _auditTrailService;

        public UpdateCorrespondenceContentHandler(
            IBaseRepository<Correspondence> correspondenceRepository,
            ICurrentUserService currentUserService,
            IBaseRepository<User> userRepository,
            ICorrespondenceNotificationService notificationService,
            IAuditTrailService auditTrailService)
        {
            _correspondenceRepository = correspondenceRepository;
            _currentUserService = currentUserService;
            _userRepository = userRepository;
            _notificationService = notificationService;
            _auditTrailService = auditTrailService;
        }

        public async Task<Response<bool>> Handle(UpdateCorrespondenceContentCommand request, CancellationToken cancellationToken)
        {
            var correspondence = await _correspondenceRepository.Find(x => x.Id == request.CorrespondenceId);
            if (correspondence == null)
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage<bool>(false);
            }

            var currentUser = await _userRepository.Find(x => x.Id == _currentUserService.UserId);
            if (currentUser == null)
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage<bool>(false);
            }

            // Update the correspondence using UpdateEntity method
            var updateProperties = new
            {
                Subject = request.Subject!,
                BodyText = request.BodyText,
                SecrecyLevel = request.SecrecyLevel!.Value,
                PriorityLevel = request.PriorityLevel!.Value,
                PersonalityLevel = request.PersonalityLevel!.Value,
                LastUpdateAt = DateTime.UtcNow,
                LastUpdateBy = currentUser.Id
            };

            var updateResult = await _correspondenceRepository.UpdateEntity(
                x => x.Id == request.CorrespondenceId,
                updateProperties,
                cancellationToken);

            if (!updateResult)
            {
                return ErrorsMessage.FailOnUpdate.ToErrorMessage<bool>(false);
            }

            await _auditTrailService.CreateAuditLogAsync(
                "تحديث محتوى الكتاب",
                "الكتاب",
                correspondence.Id,
                _currentUserService.UserId,
                $"تم تحديث محتوى الكتاب برقم {correspondence.MailNum}",
                "127.0.0.1");

            // Send real-time notification
            await _notificationService.NotifyCorrespondenceUpdatedAsync(correspondence.Id);
            await _notificationService.NotifyInboxUpdateAsync();

            return Response<bool>.Success(true, new MessageResponse { Code = "Succeeded", Message = "Correspondence updated successfully" });
        }
    }
}
