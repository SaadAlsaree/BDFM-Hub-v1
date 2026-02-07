using BDFM.Application.Contracts.Identity;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.AnnouncementFeature.Commands.CreateAnnouncement
{
    public class CreateAnnouncementCommandHandler : IRequestHandler<CreateAnnouncementCommand, Response<Guid>>
    {
        private readonly IBaseRepository<Announcement> _announcementRepository;
        private readonly ICurrentUserService _currentUserService;

        public CreateAnnouncementCommandHandler(IBaseRepository<Announcement> announcementRepository, ICurrentUserService currentUserService)
        {
            _announcementRepository = announcementRepository;
            _currentUserService = currentUserService;
        }

        public async Task<Response<Guid>> Handle(CreateAnnouncementCommand request, CancellationToken cancellationToken)
        {
            var announcement = new Announcement
            {
                Title = request.Title,
                Description = request.Description,
                Variant = request.Variant,
                StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc),
                EndDate = DateTime.SpecifyKind(request.EndDate, DateTimeKind.Utc),
                IsActive = request.IsActive,
                UserId = _currentUserService.UserId,
                OrganizationalUnitId = _currentUserService.OrganizationalUnitId ?? Guid.Empty
            };

            var result = await _announcementRepository.Create(announcement, cancellationToken);

            if (result == null)
            {
                return ErrorsMessage.FailOnCreate.ToErrorMessage<Guid>(Guid.Empty);
            }

            return SuccessMessage.Create.ToSuccessMessage(result.Id);
        }
    }
}
