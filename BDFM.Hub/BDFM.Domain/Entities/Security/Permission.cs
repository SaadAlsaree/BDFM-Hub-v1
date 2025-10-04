using BDFM.Domain.Common;

namespace BDFM.Domain.Entities.Security
{
    public class Permission : AuditableEntity<Guid>
    {
        [Required]
        [StringLength(255)] // Make unique in DB context
        public string Name { get; set; } = string.Empty; // e.g., CreateExternalMail
        public string Value { get; set; } = string.Empty;
        public string? Description { get; set; } // Text type in DB

        // Navigation Properties
        public virtual ICollection<UserPermission> UserPermissions { get; set; } = new HashSet<UserPermission>();
        public virtual ICollection<UnitPermission> UnitPermissions { get; set; } = new HashSet<UnitPermission>();
        public virtual ICollection<Delegation> Delegations { get; set; } = new HashSet<Delegation>(); // If permission is delegated
    }
}
