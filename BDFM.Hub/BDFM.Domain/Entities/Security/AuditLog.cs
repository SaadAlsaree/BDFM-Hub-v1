using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;

namespace BDFM.Domain.Entities.Security
{
    public class AuditLog : AuditableEntity<Guid>
    {
        public Guid? UserId { get; set; } // Nullable if system action
        public virtual User? User { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [StringLength(255)]
        public string Action { get; set; } = string.Empty; // e.g., "Login", "Create Correspondence"

        [StringLength(100)]
        public string? AffectedEntity { get; set; } // Table name
        public Guid? AffectedEntityId { get; set; } // ID of the record in AffectedEntity table

        public string? Details { get; set; } // Text type in DB (Old/New values as JSON)

        [StringLength(45)]
        public string? IpAddress { get; set; }
    }
}
