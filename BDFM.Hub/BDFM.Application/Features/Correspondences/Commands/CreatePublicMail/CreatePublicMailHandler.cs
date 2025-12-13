using BDFM.Application.Contracts.AI;
using BDFM.Application.Contracts.Identity;
using BDFM.Application.Helper;
using BDFM.Application.Services;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Commands.CreatePublicMail;

public class CreatePublicMailHandler : IRequestHandler<CreatePublicMailCommand, Response<Guid>>
{
    private readonly IBaseRepository<Correspondence> _repository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAuditTrailService _auditTrailService;
    private readonly IMailNumberGenerator _mailNumberGenerator;
    private readonly IBaseRepository<User> _userRepository;
    //private readonly IRAGService _ragService;

    public CreatePublicMailHandler(IBaseRepository<Correspondence> repository, ICurrentUserService currentUserService, IAuditTrailService auditTrailService, IRAGService rAGService, IMailNumberGenerator mailNumberGenerator, IBaseRepository<User> userRepository)
    {
        _repository = repository;
        _currentUserService = currentUserService;
        _auditTrailService = auditTrailService;
        _mailNumberGenerator = mailNumberGenerator;
        _userRepository = userRepository;
        //_ragService = rAGService;
    }

    public async Task<Response<Guid>> Handle(CreatePublicMailCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // 1- Get current user
            var currentUser = await _userRepository.Find(x => x.Id == _currentUserService.UserId);
            if (currentUser == null)
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage<Guid>(Guid.Empty);
            }

            // Create public mail
            var publicMail = new Correspondence
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
                Status = CorrespondenceStatusEnum.Completed,
                CorrespondenceType = CorrespondenceTypeEnum.Public,
                ExternalReferenceNumber = request.ExternalReferenceNumber,
                ExternalReferenceDate = request.ExternalReferenceDate.HasValue ?
                    DateOnly.FromDateTime(request.ExternalReferenceDate.Value) : null,
                CorrespondenceOrganizationalUnitId = currentUser.OrganizationalUnitId,
            };

            // Save public mail
            publicMail = await _repository.Create(publicMail, cancellationToken);

            await _auditTrailService.CreateAuditLogAsync(
                "إنشاء كتاب إعلان عام",
                "الكتاب",
                publicMail.Id,
                _currentUserService.UserId,
                $"تم إنشاء كتاب إعلان عام برقم {publicMail.MailNum}",
                "127.0.0.1");

            //var mailRag = new CreateCorrespondenceRequest
            //{
            //    MailNum = publicMail.MailNum,
            //    MailDate = publicMail.MailDate,
            //    Subject = publicMail.Subject,
            //    BodyText = publicMail.BodyText ?? string.Empty,
            //    SecrecyLevel = publicMail.SecrecyLevel.GetDisplayNameSafe(),
            //    PriorityLevel = publicMail.PriorityLevel.GetDisplayNameSafe(),
            //    PersonalityLevel = publicMail.PersonalityLevel.GetDisplayNameSafe(),
            //    FileId = publicMail.FileId.ToString() ?? string.Empty,
            //    CreatedAt = publicMail.CreateAt,
            //};
            //// Generate embeddings for the public mail
            //await _ragService.ProcessCorrespondenceAsync(mailRag);

            return Response<Guid>.Success(publicMail.Id, new MessageResponse { Code = "Succeeded", Message = "Public mail created successfully" });
        }
        catch (Exception ex)
        {
            return Response<Guid>.Fail(
                new List<object> { "An error occurred while creating the public mail" },
                new MessageResponse { Code = "Error", Message = ex.Message });
        }
    }
}
