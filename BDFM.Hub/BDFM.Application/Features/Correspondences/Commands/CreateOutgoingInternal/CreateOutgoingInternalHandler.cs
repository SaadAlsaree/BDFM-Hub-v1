
using BDFM.Application.Contracts.AI;
using BDFM.Application.Contracts.Identity;
using BDFM.Application.Helper;
using BDFM.Application.Services;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Commands.CreateOutgoingInternal
{
    internal class CreateOutgoingInternalHandler : IRequestHandler<CreateOutgoingInternalCommand, Response<bool>>
    {

        private readonly IBaseRepository<Correspondence> _correspondencRepository;
        private readonly IBaseRepository<CorrespondenceLink> _correspondencLinkRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IAuditTrailService _auditTrailService;
        private readonly IMailNumberGenerator _mailNumberGenerator;
        private readonly IBaseRepository<User> _userRepository;
        //private readonly IRAGService _ragService;


        public CreateOutgoingInternalHandler(
            IBaseRepository<Correspondence> correspondencRepository,
            IBaseRepository<CorrespondenceLink> correspondencLinkRepository,
            ICurrentUserService currentUserService,
            IAuditTrailService auditTrailService,
            IRAGService ragService,
            IMailNumberGenerator mailNumberGenerator,
            IBaseRepository<User> userRepository)
        {
            _correspondencRepository = correspondencRepository;
            _correspondencLinkRepository = correspondencLinkRepository;
            _currentUserService = currentUserService;
            _auditTrailService = auditTrailService;
            _mailNumberGenerator = mailNumberGenerator;
            _userRepository = userRepository;
            //_ragService = ragService;
        }


        public async Task<Response<bool>> Handle(CreateOutgoingInternalCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // 1- Get current user
                var currentUser = await _userRepository.Find(x => x.Id == _currentUserService.UserId);
                if (currentUser == null)
                {
                    return ErrorsMessage.NotFoundData.ToErrorMessage<bool>(false);
                }

                // Create correspondence
                var correspondenc = new Correspondence
                {
                    MailNum = _mailNumberGenerator.GetUniqueMailNumber(),
                    MailDate = request.MailDate,
                    Subject = request.Subject,
                    BodyText = request.BodyText,
                    SecrecyLevel = request.SecrecyLevel,
                    PriorityLevel = request.PriorityLevel,
                    PersonalityLevel = request.PersonalityLevel,
                    FileId = request.FileId,
                    IsDraft = false,
                    CreateByUserId = _currentUserService.UserId,
                    CreateAt = DateTime.UtcNow,
                    Status = CorrespondenceStatusEnum.PendingReferral,
                    CorrespondenceType = CorrespondenceTypeEnum.OutgoingInternal,
                    CorrespondenceOrganizationalUnitId = currentUser.OrganizationalUnitId,
                };
                var outgoingInternal = await _correspondencRepository.Create(correspondenc, cancellationToken);

                // Create link
                if (request.LinkMailId != Guid.Empty)
                {
                    await _correspondencLinkRepository.Create(new CorrespondenceLink
                    {
                        SourceCorrespondenceId = outgoingInternal.Id,
                        LinkedCorrespondenceId = request.LinkMailId,
                        LinkType = CorrespondenceLinkType.ReplyTo,
                        CreateAt = DateTime.UtcNow,
                        CreateBy = _currentUserService.UserId,
                    }, cancellationToken);
                }

                //var mailRag = new CreateCorrespondenceRequest
                //{
                //    MailNum = outgoingInternal.MailNum,
                //    MailDate = outgoingInternal.MailDate,
                //    Subject = outgoingInternal.Subject,
                //    BodyText = outgoingInternal.BodyText ?? string.Empty,
                //    SecrecyLevel = outgoingInternal.SecrecyLevel.GetDisplayNameSafe(),
                //    PriorityLevel = outgoingInternal.PriorityLevel.GetDisplayNameSafe(),
                //    PersonalityLevel = outgoingInternal.PersonalityLevel.GetDisplayNameSafe(),
                //    FileId = outgoingInternal.FileId.ToString() ?? string.Empty,
                //    CreatedAt = outgoingInternal.CreateAt,
                //};
                //// 4- Generate embeddings for the mail draft
                //await _ragService.ProcessCorrespondenceAsync(mailRag);

                // Create audit trail
                await _auditTrailService.CreateAuditLogAsync(
                    "إنشاء كتاب صادر داخلي",
                    "الكتاب",
                    outgoingInternal.Id,
                    _currentUserService.UserId,
                    $"تم إنشاء كتاب صادر داخلي برقم {outgoingInternal.MailNum}",
                    "127.0.0.1");

                return Response<bool>.Success(true);

            }
            catch (Exception)
            {
                return Response<bool>.Fail(new List<object> { "An error occurred while creating the outgoing internal mail" }, new MessageResponse { Code = "Error", Message = "An error occurred while creating the outgoing internal mail" });
            }
        }
    }
}
