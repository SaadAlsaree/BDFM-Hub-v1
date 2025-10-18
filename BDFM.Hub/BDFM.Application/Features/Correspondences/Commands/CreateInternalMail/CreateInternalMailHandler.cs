using BDFM.Application.Contracts.AI;
using BDFM.Application.Contracts.Identity;
using BDFM.Application.Contracts.SignalR;
using BDFM.Application.Helper;
using BDFM.Application.Services;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Commands.CreateInternalMail
{
    public class CreateInternalMailHandler : IRequestHandler<CreateInternalMailCommand, Response<Guid>>
    {
        private readonly IBaseRepository<Correspondence> _correspondenceRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IBaseRepository<User> _userRepository;
        private readonly ICorrespondenceNotificationService _notificationService;
        private readonly ILogger<CreateInternalMailHandler> _logger;
        private readonly IAuditTrailService _auditTrailService;
        private readonly IMailNumberGenerator _mailNumberGenerator;
        //private readonly IRAGService _ragService;

        public CreateInternalMailHandler(
            IBaseRepository<Correspondence> correspondenceRepository,
            ICurrentUserService currentUserService,
            IBaseRepository<User> userRepository,
            ICorrespondenceNotificationService notificationService,
            ILogger<CreateInternalMailHandler> logger,
            IAuditTrailService auditTrailService,
            IRAGService ragService,
            IMailNumberGenerator mailNumberGenerator)
        {
            _correspondenceRepository = correspondenceRepository;
            _currentUserService = currentUserService;
            _userRepository = userRepository;
            _notificationService = notificationService;
            _logger = logger;
            _auditTrailService = auditTrailService;
            _mailNumberGenerator = mailNumberGenerator;
            //_ragService = ragService;
        }

        public async Task<Response<Guid>> Handle(CreateInternalMailCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Handling CreateInternalMail request");

                // 1- Get current user
                var currentUser = await _userRepository.Find(x => x.Id == _currentUserService.UserId);
                if (currentUser == null)
                {
                    return ErrorsMessage.NotFoundData.ToErrorMessage<Guid>(Guid.Empty);
                }



                // 1. Create a new Correspondence record
                var correspondence = new Correspondence
                {
                    MailNum = _mailNumberGenerator.GetUniqueMailNumber(),
                    MailDate = request.MailDate,
                    Subject = request.Subject,
                    BodyText = request.BodyText,
                    FileId = request.FileId,
                    CorrespondenceType = CorrespondenceTypeEnum.IncomingInternal,
                    SecrecyLevel = request.SecrecyLevel,
                    PriorityLevel = request.PriorityLevel,
                    PersonalityLevel = request.PersonalityLevel,
                    Status = request.IsDraft ? CorrespondenceStatusEnum.PendingReferral : CorrespondenceStatusEnum.PendingReferral,
                    IsDraft = request.IsDraft,
                    StatusId = Status.Unverified,
                    CreateAt = DateTime.UtcNow,
                    CreateBy = currentUser.Id,
                    CreateByUserId = currentUser.Id,
                };

                //var mailRag = new CreateCorrespondenceRequest
                //{
                //    MailNum = correspondence.MailNum,
                //    MailDate = correspondence.MailDate,
                //    Subject = correspondence.Subject,
                //    BodyText = correspondence.BodyText ?? string.Empty,
                //    SecrecyLevel = correspondence.SecrecyLevel.GetDisplayNameSafe(),
                //    PriorityLevel = correspondence.PriorityLevel.GetDisplayNameSafe(),
                //    PersonalityLevel = correspondence.PersonalityLevel.GetDisplayNameSafe(),
                //    FileId = correspondence.FileId.ToString() ?? string.Empty,
                //    CreatedAt = correspondence.CreateAt,
                //};
                //// 4- Generate embeddings for the mail draft
                //await _ragService.ProcessCorrespondenceAsync(mailRag);

                // Create the correspondence
                correspondence = await _correspondenceRepository.Create(correspondence, cancellationToken);

                await _auditTrailService.CreateAuditLogAsync(
                    "إنشاء كتاب داخلي",
                    "الكتاب",
                    correspondence.Id,
                    _currentUserService.UserId,
                    $"تم إنشاء كتاب داخلي برقم {correspondence.MailNum}",
                    "127.0.0.1");

                // Send real-time notification
                await _notificationService.NotifyCorrespondenceCreatedAsync(correspondence.Id);
                await _notificationService.NotifyInboxUpdateAsync();

                // 2. Log action in AuditLog (handled by AuditableEntity)

                return Response<Guid>.Success(correspondence.Id,
                    new MessageResponse { Code = "Succeeded", Message = "Internal mail created successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating internal mail: {Message}", ex.Message);
                return Response<Guid>.Fail(
                    new List<object> { "An error occurred while creating the internal mail" },
                    new MessageResponse { Code = "Error", Message = ex.Message });
            }
        }


    }
}
