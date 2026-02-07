namespace BDFM.Application.Features.AnnouncementFeature.Commands.DeleteAnnouncement
{
    public class DeleteAnnouncementCommand : IRequest<Response<bool>>
    {
        public Guid Id { get; set; }
    }
}
