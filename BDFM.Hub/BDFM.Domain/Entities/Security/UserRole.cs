using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;

namespace BDFM.Domain.Entities.Security
{
    public class UserRole : AuditableEntity<Guid>
    {
        public Guid UserId { get; set; }
        public virtual User User { get; set; } = default!;

        public Guid RoleId { get; set; }
        public virtual Role Role { get; set; } = default!;
    }
}
