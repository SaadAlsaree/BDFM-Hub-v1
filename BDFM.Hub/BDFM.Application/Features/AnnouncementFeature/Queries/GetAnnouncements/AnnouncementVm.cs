namespace BDFM.Application.Features.AnnouncementFeature.Queries.GetAnnouncements
{
    public class AnnouncementVm
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Variant { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public Guid UserId { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public Guid OrganizationalUnitId { get; set; }
        public string UnitName { get; set; } = string.Empty;

        public DateTime CreateAt { get; set; }
    }
}
