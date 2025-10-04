using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;

namespace BDFM.Domain.Entities.Security
{
    public class UnitPermission : AuditableEntity<Guid>
    {
        public Guid UnitId { get; set; }
        public virtual OrganizationalUnit Unit { get; set; } = default!;

        public Guid PermissionId { get; set; }
        public virtual Permission Permission { get; set; } = default!;

        public bool GrantedBySystemAdmin { get; set; } = false;
    }
}
