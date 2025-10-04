using BDFM.Application.Contracts.AI;
using BDFM.Application.Contracts.Identity;
using BDFM.Application.Helper;
using BDFM.Application.Services;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Commands.CreateMailDraft
{
    public class CreateMailDraftHandler : IRequestHandler<CreateMailDraftCommand, Response<Guid>>
    {


        private readonly IBaseRepository<Correspondence> _repository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IAuditTrailService _auditTrailService;
        private readonly IMailNumberGenerator _mailNumberGenerator;
        //private readonly IRAGService _ragService;

        public CreateMailDraftHandler(IBaseRepository<Correspondence> repository, ICurrentUserService currentUserService, IAuditTrailService auditTrailService, IRAGService rAGService, IMailNumberGenerator mailNumberGenerator)
        {
            _repository = repository;
            _currentUserService = currentUserService;
            _auditTrailService = auditTrailService;
            _mailNumberGenerator = mailNumberGenerator;
            //_ragService = rAGService;
        }


        public async Task<Response<Guid>> Handle(CreateMailDraftCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // 2- Create mail draft
                var mailDraft = new Correspondence
                {
                    MailNum = _mailNumberGenerator.GetUniqueMailNumber(),
                    MailDate = request.MailDate,
                    Subject = request.Subject,
                    BodyText = request.BodyText,
                    SecrecyLevel = request.SecrecyLevel,
                    PriorityLevel = request.PriorityLevel,
                    PersonalityLevel = request.PersonalityLevel,
                    CreateBy = request.CreatedByUserId,
                    CreateByUserId = request.CreatedByUserId,
                    IsDraft = false,
                    FileId = request.FileId,
                    CreateAt = DateTime.UtcNow,
                    Status = CorrespondenceStatusEnum.Registered,
                    CorrespondenceType = CorrespondenceTypeEnum.Draft,
                };

                // 3- Save mail draft
                mailDraft = await _repository.Create(mailDraft, cancellationToken);

                await _auditTrailService.CreateAuditLogAsync(
                    "إنشاء كتاب مسودة",
                    "الكتاب",
                    mailDraft.Id,
                    _currentUserService.UserId,
                    $"تم إنشاء كتاب مسودة برقم {mailDraft.MailNum}",
                    "127.0.0.1");

                //var mailRag = new CreateCorrespondenceRequest
                //{
                //    MailNum = mailDraft.MailNum,
                //    MailDate = mailDraft.MailDate,
                //    Subject = mailDraft.Subject,
                //    BodyText = mailDraft.BodyText ?? string.Empty,
                //    SecrecyLevel = mailDraft.SecrecyLevel.GetDisplayNameSafe(),
                //    PriorityLevel = mailDraft.PriorityLevel.GetDisplayNameSafe(),
                //    PersonalityLevel = mailDraft.PersonalityLevel.GetDisplayNameSafe(),
                //    FileId = mailDraft.FileId.ToString() ?? string.Empty,
                //    CreatedAt = mailDraft.CreateAt,
                //};
                //// 4- Generate embeddings for the mail draft
                //await _ragService.ProcessCorrespondenceAsync(mailRag);

                return Response<Guid>.Success(mailDraft.Id, new MessageResponse { Code = "Succeeded", Message = "Mail draft created successfully" });
            }
            catch (Exception ex)
            {
                return Response<Guid>.Fail(
                    new List<object> { "An error occurred while creating the mail draft" },
                    new MessageResponse { Code = "Error", Message = ex.Message });
            }
        }
    }
}
