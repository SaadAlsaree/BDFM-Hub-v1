namespace BDFM.Application.Features.AnnouncementFeature.Commands.UpdateAnnouncement
{
    public class UpdateAnnouncementCommand : IRequest<Response<bool>>
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Variant { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
    }
}
