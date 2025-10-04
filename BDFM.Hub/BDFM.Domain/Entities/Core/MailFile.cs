using BDFM.Domain.Common;

namespace BDFM.Domain.Entities.Core
{
    public class MailFile : AuditableEntity<Guid>
    {


        [StringLength(100)] // Make unique in DB context
        public string FileNumber { get; set; } = string.Empty; // e.g., "500-2025"
        public string Name { get; set; } = string.Empty;
        public string? Subject { get; set; } // Text type in DB

        // Navigation Properties
        public virtual ICollection<Correspondence> Correspondences { get; set; } = new HashSet<Correspondence>();
    }
}

