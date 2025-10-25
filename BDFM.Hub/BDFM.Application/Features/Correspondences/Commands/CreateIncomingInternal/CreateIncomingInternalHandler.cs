using BDFM.Application.Contracts.AI;
using BDFM.Application.Contracts.Identity;
using BDFM.Application.Helper;
using BDFM.Application.Services;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Commands.CreateIncomingInternal
{
    internal class CreateIncomingInternalHandler : IRequestHandler<CreateIncomingInternalCommand, Response<bool>>
    {
        private readonly IBaseRepository<Correspondence> _correspondencRepository;
        private readonly IBaseRepository<CorrespondenceLink> _correspondencLinkRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IAuditTrailService _auditTrailService;
        private readonly IMailNumberGenerator _mailNumberGenerator;
        private readonly IBaseRepository<User> _userRepository;
        //private readonly IRAGService _ragService;


        public CreateIncomingInternalHandler(
            IBaseRepository<Correspondence> correspondencRepository,
            IBaseRepository<CorrespondenceLink> correspondencLinkRepository,
            ICurrentUserService currentUserService,
            IBaseRepository<User> userRepository,
            IAuditTrailService auditTrailService,
            IRAGService ragService,
            IMailNumberGenerator mailNumberGenerator)
        {
            _correspondencRepository = correspondencRepository;
            _correspondencLinkRepository = correspondencLinkRepository;
            _currentUserService = currentUserService;
            _userRepository = userRepository;
            _auditTrailService = auditTrailService;
            _mailNumberGenerator = mailNumberGenerator;
            //_ragService = ragService;
        }
        public async Task<Response<bool>> Handle(CreateIncomingInternalCommand request, CancellationToken cancellationToken)
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
                    CreateByUserId = _currentUserService.UserId,
                    CreateAt = DateTime.UtcNow,
                    Status = CorrespondenceStatusEnum.PendingReferral,
                    CorrespondenceType = CorrespondenceTypeEnum.IncomingInternal,
                    CorrespondenceOrganizationalUnitId = _currentUserService.OrganizationalUnitId,
                };
                var incomingInternal = await _correspondencRepository.Create(correspondenc, cancellationToken);

                // Create link
                if (request.LinkMailId != Guid.Empty)
                {
                    await _correspondencLinkRepository.Create(new CorrespondenceLink
                    {
                        SourceCorrespondenceId = incomingInternal.Id,
                        LinkedCorrespondenceId = request.LinkMailId,
                        LinkType = CorrespondenceLinkType.RefersTo,
                        CreateAt = DateTime.UtcNow,
                        CreateBy = _currentUserService.UserId,
                    }, cancellationToken);
                }

                //var mailRag = new CreateCorrespondenceRequest
                //{
                //    MailNum = incomingInternal.MailNum,
                //    MailDate = incomingInternal.MailDate,
                //    Subject = incomingInternal.Subject,
                //    BodyText = incomingInternal.BodyText ?? string.Empty,
                //    SecrecyLevel = incomingInternal.SecrecyLevel.GetDisplayNameSafe(),
                //    PriorityLevel = incomingInternal.PriorityLevel.GetDisplayNameSafe(),
                //    PersonalityLevel = incomingInternal.PersonalityLevel.GetDisplayNameSafe(),
                //    FileId = incomingInternal.FileId.ToString() ?? string.Empty,
                //    CreatedAt = incomingInternal.CreateAt,
                //};
                // 4- Generate embeddings for the mail draft
                //await _ragService.ProcessCorrespondenceAsync(mailRag);

                // Create audit trail
                await _auditTrailService.CreateAuditLogAsync(
                 "إنشاء كتاب وارد داخلي",
                 "الكتاب",
                 incomingInternal.Id,
                 _currentUserService.UserId,
                 $"تم إنشاء كتاب وارد داخلي برقم {incomingInternal.MailNum}",
                 "127.0.0.1");


                return Response<bool>.Success(true);
            }
            catch (Exception)
            {
                return Response<bool>.Fail(new List<object> { "An error occurred while creating the incoming internal mail" }, new MessageResponse { Code = "Error", Message = "An error occurred while creating the incoming internal mail" });
            }

        }
    }
}
