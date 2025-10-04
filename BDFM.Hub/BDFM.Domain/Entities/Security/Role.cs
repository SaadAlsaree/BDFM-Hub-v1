using BDFM.Domain.Common;

namespace BDFM.Domain.Entities.Security
{
    public class Role : AuditableEntity<Guid>
    {

        [StringLength(255)] // Make unique in DB context
        public string Name { get; set; } = string.Empty; // e.g., "Admin", "User", "Manager"
        public string Value { get; set; } = string.Empty;
        public string? Description { get; set; } // Text type in DB

        // Navigation Properties
        public virtual ICollection<UserRole> UserRoles { get; set; } = new HashSet<UserRole>();
        public virtual ICollection<Delegation> Delegations { get; set; } = new HashSet<Delegation>(); // If role is delegated
    }
}
