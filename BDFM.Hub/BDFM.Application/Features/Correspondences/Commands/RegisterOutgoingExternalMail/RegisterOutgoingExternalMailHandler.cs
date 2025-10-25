using BDFM.Application.Contracts.AI;
using BDFM.Application.Exceptions;
using BDFM.Application.Helper;
using BDFM.Application.Services;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Workflow;

namespace BDFM.Application.Features.Correspondences.Commands.RegisterOutgoingExternalMail
{
    internal class RegisterOutgoingExternalMailHandler : IRequestHandler<RegisterOutgoingExternalMailCommand, Response<Guid>>
    {
        private readonly IBaseRepository<Correspondence> _correspondenceRepository;
        private readonly IBaseRepository<WorkflowStep> _workflowStepRepository;
        private readonly IBaseRepository<MailFile> _mailFileRepository;
        private readonly IBaseRepository<User> _userRepository;
        private readonly IAuditTrailService _auditTrailService;
        private readonly IMailNumberGenerator _mailNumberGenerator;
        //private readonly IRAGService _ragService;

        public RegisterOutgoingExternalMailHandler(
            IBaseRepository<Correspondence> correspondenceRepository,
            IBaseRepository<WorkflowStep> workflowStepRepository,
            IBaseRepository<MailFile> mailFileRepository,
            IBaseRepository<User> userRepository,
            IAuditTrailService auditTrailService,
            IRAGService ragService,
            IMailNumberGenerator mailNumberGenerator)
        {
            _correspondenceRepository = correspondenceRepository;
            _workflowStepRepository = workflowStepRepository;
            _mailFileRepository = mailFileRepository;
            _userRepository = userRepository;
            _auditTrailService = auditTrailService;
            _mailNumberGenerator = mailNumberGenerator;
        }
        public async Task<Response<Guid>> Handle(RegisterOutgoingExternalMailCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // 0. get user and unit info info
                var currentUser = await _userRepository.Find(u => u.Id == request.CreatedByUserId, cancellationToken: cancellationToken);
                // 1. Determine or Create MailFile
                MailFile mailFile;
                if (!string.IsNullOrWhiteSpace(request.FileNumberToReuse))
                {
                    mailFile = await _mailFileRepository.Find(mf => mf.FileNumber == request.FileNumberToReuse);

                    if (mailFile == null)
                    {
                        // Option 1: Fail if specified file number to reuse doesn't exist
                        throw new NotFoundException(nameof(MailFile), request.FileNumberToReuse);
                    }
                }
                else
                {
                    return Response<Guid>.Fail(new MessageResponse { Message = "File number to reuse is required" });
                }

                // 2. Create Correspondence Entity
                var correspondence = new Correspondence
                {
                    FileId = mailFile.Id,
                    CorrespondenceType = CorrespondenceTypeEnum.OutgoingExternal,
                    Subject = request.Subject,
                    BodyText = request.BodyText,
                    SecrecyLevel = request.SecrecyLevel,
                    PriorityLevel = request.PriorityLevel,
                    PersonalityLevel = request.PersonalityLevel,
                    MailNum = _mailNumberGenerator.GetUniqueMailNumber(),
                    MailDate = request.MailDate,
                    ExternalEntityId = request.ExternalEntityId,
                    Status = CorrespondenceStatusEnum.PendingReferral,
                    CreateBy = currentUser.Id,
                    CreateAt = DateTime.UtcNow,
                    StatusId = Status.Unverified,
                    IsDraft = false,
                    CreateByUserId = request.CreatedByUserId,
                    CorrespondenceOrganizationalUnitId = currentUser.OrganizationalUnitId,
                };

                await _correspondenceRepository.Create(correspondence, cancellationToken);



                // 4. Create initial WorkflowStep (Registered by Central Mail)
                var initialWorkflowStep = new WorkflowStep
                {
                    CorrespondenceId = correspondence.Id,
                    ActionType = ActionTypeEnum.RegisterIncoming,
                    FromUserId = currentUser.Id,
                    ToPrimaryRecipientType = RecipientTypeEnum.User, // Typically goes to a mail room supervisor or equivalent
                    ToPrimaryRecipientId = request.CreatedByUserId, // Usually the same person, but could be configured differently
                    InstructionText = $"تم أدخال الكتاب برقم {correspondence.MailNum} من قبل {currentUser.Username}",
                    Status = WorkflowStepStatus.Completed, // This step is completed upon registration
                    FromUnitId = currentUser.OrganizationalUnitId,
                    CreateBy = currentUser.Id,
                    CreateAt = DateTime.UtcNow,
                    StatusId = Status.Unverified
                };
                await _workflowStepRepository.Create(initialWorkflowStep, cancellationToken);

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

                //await _ragService.ProcessCorrespondenceAsync(mailRag);

                await _auditTrailService.CreateAuditLogAsync(

                    "إنشاء كتاب خارجي",
                    "الكتاب",
                    correspondence.Id,
                    currentUser.Id,
                    $"تم إنشاء كتاب خارجي برقم {correspondence.MailNum}",
                    "127.0.0.1");

                // if OriginatingSubEntities then create 

                // 5. Return success response
                return Response<Guid>.Success(correspondence.Id, new MessageResponse { Message = "Incoming external mail registered successfully" });
            }
            catch (Exception ex)
            {
                return Response<Guid>.Fail(new MessageResponse { Message = "Failed to register incoming external mail: " + ex.Message });
            }
        }

    }
}

