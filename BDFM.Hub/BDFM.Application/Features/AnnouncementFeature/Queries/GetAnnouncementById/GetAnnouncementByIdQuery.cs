using BDFM.Application.Features.AnnouncementFeature.Queries.GetAnnouncements;

namespace BDFM.Application.Features.AnnouncementFeature.Queries.GetAnnouncementById
{
    public class GetAnnouncementByIdQuery : IRequest<Response<AnnouncementVm>>
    {
        public Guid Id { get; set; }
    }
}
