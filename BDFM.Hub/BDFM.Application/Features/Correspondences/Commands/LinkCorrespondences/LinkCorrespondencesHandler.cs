using BDFM.Application.Contracts.Identity;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Commands.LinkCorrespondences
{
    public class LinkCorrespondencesHandler : IRequestHandler<LinkCorrespondencesCommand, Response<Guid>>
    {
        private readonly IBaseRepository<CorrespondenceLink> _correspondenceLinkRepository;
        private readonly IBaseRepository<Correspondence> _correspondenceRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly ILogger<LinkCorrespondencesHandler> _logger;

        public LinkCorrespondencesHandler(
            IBaseRepository<CorrespondenceLink> correspondenceLinkRepository,
            IBaseRepository<Correspondence> correspondenceRepository,
            ICurrentUserService currentUserService,
            ILogger<LinkCorrespondencesHandler> logger)
        {
            _correspondenceLinkRepository = correspondenceLinkRepository;
            _correspondenceRepository = correspondenceRepository;
            _currentUserService = currentUserService;
            _logger = logger;
        }

        public async Task<Response<Guid>> Handle(LinkCorrespondencesCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // 1. Validate IDs exist and are not the same
                if (request.SourceCorrespondenceId == request.LinkedCorrespondenceId)
                {
                    return ErrorsMessage.NotExistOnCreate.ToErrorMessage<Guid>(Guid.Empty);
                }

                // Check if both correspondences exist
                var sourceExists = await _correspondenceRepository.Find(c => c.Id == request.SourceCorrespondenceId);
                if (sourceExists == null)
                {
                    return ErrorsMessage.NotFoundData.ToErrorMessage<Guid>(Guid.Empty);
                }

                var linkedExists = await _correspondenceRepository.Find(c => c.Id == request.LinkedCorrespondenceId);
                if (linkedExists == null)
                {
                    return ErrorsMessage.NotFoundData.ToErrorMessage<Guid>(Guid.Empty);
                }

                // 2. Check if link of the same type already exists to prevent duplicates
                var existingLink = await _correspondenceLinkRepository.Find(
                    cl => cl.SourceCorrespondenceId == request.SourceCorrespondenceId &&
                          cl.LinkedCorrespondenceId == request.LinkedCorrespondenceId &&
                          cl.LinkType == request.LinkType);

                if (existingLink != null)
                {
                    return ErrorsMessage.ExistOnCreate.ToErrorMessage<Guid>(Guid.Empty);
                }

                // 3. Create CorrespondenceLink record
                var currentUserId = _currentUserService.UserId;

                var correspondenceLink = new CorrespondenceLink
                {
                    Id = Guid.NewGuid(),
                    SourceCorrespondenceId = request.SourceCorrespondenceId,
                    LinkedCorrespondenceId = request.LinkedCorrespondenceId,
                    LinkType = request.LinkType,
                    Notes = request.Notes,
                    StatusId = Status.Active,
                    CreateAt = DateTime.UtcNow,
                    CreateBy = currentUserId
                };

                await _correspondenceLinkRepository.Create(correspondenceLink, cancellationToken);

                // 4. Log action
                _logger.LogInformation(
                    "User {UserId} ({UserName}) linked correspondence {SourceId} to {LinkedId} with type {LinkType}",
                    _currentUserService.UserId,
                    _currentUserService.UserName,
                    request.SourceCorrespondenceId,
                    request.LinkedCorrespondenceId,
                    request.LinkType.ToString());

                return SuccessMessage.Create.ToSuccessMessage(correspondenceLink.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error linking correspondences. SourceId: {SourceId}, LinkedId: {LinkedId}, LinkType: {LinkType}",
                    request.SourceCorrespondenceId,
                    request.LinkedCorrespondenceId,
                    request.LinkType);

                return ErrorsMessage.FailOnCreate.ToErrorMessage<Guid>(Guid.Empty);
            }
        }
    }
}
