using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;

namespace BDFM.Domain.Entities.Workflow
{
    public class DraftVersion : AuditableEntity<Guid>
    {
        public Guid CorrespondenceId { get; set; }
        public virtual Correspondence Correspondence { get; set; } = default!;

        public int VersionNumber { get; set; }

        public string? BodyText { get; set; } // LongText type in DB

        public Guid ChangedByUserId { get; set; }
        public virtual User ChangedByUser { get; set; } = default!;

        public DateTime ChangeTimestamp { get; set; } = DateTime.UtcNow;
        public string? ChangeReason { get; set; } // Text type in DB

        // Unique constraint (CorrespondenceId, VersionNumber) should be set in DbContext
    }
}
