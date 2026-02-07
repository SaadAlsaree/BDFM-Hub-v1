namespace BDFM.Application.Features.AnnouncementFeature.Commands.CreateAnnouncement
{
    public class CreateAnnouncementCommand : IRequest<Response<Guid>>
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Variant { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; } = true;
        public Guid UserId { get; set; }
        public Guid OrganizationalUnitId { get; set; }
    }
}
