using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;

namespace BDFM.Domain.Entities.Security
{
    public class UserPermission : AuditableEntity<Guid>
    {
        public Guid UserId { get; set; }
        public virtual User User { get; set; } = default!;

        public Guid PermissionId { get; set; }
        public virtual Permission Permission { get; set; } = default!;
    }
}
