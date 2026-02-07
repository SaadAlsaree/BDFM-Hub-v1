using BDFM.Domain.Common;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.AnnouncementFeature.Commands.UpdateAnnouncement
{
    public class UpdateAnnouncementCommandHandler : IRequestHandler<UpdateAnnouncementCommand, Response<bool>>
    {
        private readonly IBaseRepository<Announcement> _announcementRepository;

        public UpdateAnnouncementCommandHandler(IBaseRepository<Announcement> announcementRepository)
        {
            _announcementRepository = announcementRepository;
        }

        public async Task<Response<bool>> Handle(UpdateAnnouncementCommand request, CancellationToken cancellationToken)
        {
            var announcement = await _announcementRepository.Find(a => a.Id == request.Id, cancellationToken: cancellationToken);

            if (announcement == null)
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage<bool>(false);
            }

            announcement.Title = request.Title;
            announcement.Description = request.Description;
            announcement.Variant = request.Variant;
            announcement.StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc);
            announcement.EndDate = DateTime.SpecifyKind(request.EndDate, DateTimeKind.Utc);
            announcement.IsActive = request.IsActive;

            _announcementRepository.Update(announcement);

            return SuccessMessage.Update.ToSuccessMessage(true);
        }
    }
}
