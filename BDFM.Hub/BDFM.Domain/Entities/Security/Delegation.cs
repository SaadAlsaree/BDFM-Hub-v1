using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;

namespace BDFM.Domain.Entities.Security
{
    public class Delegation : AuditableEntity<Guid>
    {
        public Guid DelegatorUserId { get; set; }
        public virtual User DelegatorUser { get; set; } = default!;

        public Guid DelegateeUserId { get; set; }
        public virtual User DelegateeUser { get; set; } = default!;

        public Guid? PermissionId { get; set; } // Specific permission delegated
        public virtual Permission? Permission { get; set; }

        public Guid? RoleId { get; set; } // Or entire role delegated
        public virtual Role? Role { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
