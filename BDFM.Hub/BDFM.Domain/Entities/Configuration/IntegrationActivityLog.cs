using BDFM.Domain.Common;

namespace BDFM.Domain.Entities.Configuration
{
    public class IntegrationActivityLog : AuditableEntity<Guid>
    {
        public Guid SystemIntegrationSettingId { get; set; }
        public virtual SystemIntegrationSetting SystemIntegrationSetting { get; set; } = default!;

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string ActionName { get; set; } = string.Empty;// (e.g., "FetchEmployeeData", "ArchiveDocument")
        public bool WasSuccessful { get; set; }
        public string? RequestDetails { get; set; }
        public string? ResponseDetailsOrError { get; set; }
        public Guid? RelatedCorrespondenceId { get; set; } // إذا كان النشاط متعلقًا بمراسلة معينة
    }
}
