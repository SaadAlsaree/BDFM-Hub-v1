using BDFM.Domain.Common;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.AnnouncementFeature.Commands.DeleteAnnouncement
{
    public class DeleteAnnouncementCommandHandler : IRequestHandler<DeleteAnnouncementCommand, Response<bool>>
    {
        private readonly IBaseRepository<Announcement> _announcementRepository;

        public DeleteAnnouncementCommandHandler(IBaseRepository<Announcement> announcementRepository)
        {
            _announcementRepository = announcementRepository;
        }

        public async Task<Response<bool>> Handle(DeleteAnnouncementCommand request, CancellationToken cancellationToken)
        {
            var announcement = await _announcementRepository.Find(a => a.Id == request.Id, cancellationToken: cancellationToken);

            if (announcement == null)
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage<bool>(false);
            }

            await _announcementRepository.Delete(announcement, cancellationToken);

            return SuccessMessage.Delete.ToSuccessMessage(true);
        }
    }
}
