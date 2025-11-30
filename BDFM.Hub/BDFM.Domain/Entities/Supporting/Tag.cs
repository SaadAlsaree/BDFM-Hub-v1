using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;

namespace BDFM.Domain.Entities.Supporting
{
    public class Tag : AuditableEntity<Guid>
    {
        // Correspondence-specific tags
        public Guid CorrespondenceId { get; set; }
        public virtual Correspondence? Correspondence { get; set; }

        public string? Name { get; set; } = string.Empty;

        public bool IsAll { get; set; } = false;

        // For user-specific private tags
        public Guid? ForUserId { get; set; }
        public virtual User? User { get; set; }

        // For organizational unit specific tags
        public Guid? ForOrganizationalUnitId { get; set; }
        public virtual OrganizationalUnit? OrganizationalUnit { get; set; }


        // Navigation Properties
        public virtual ICollection<CorrespondenceTag> CorrespondenceTags { get; set; } = new HashSet<CorrespondenceTag>();
    }
}