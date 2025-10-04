using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;

namespace BDFM.Domain.Entities.Supporting
{
    public class PermittedExternalEntityCommunication : AuditableEntity<Guid>
    {
        public Guid OrganizationalUnitId { get; set; }
        public virtual OrganizationalUnit OrganizationalUnit { get; set; } = default!;


        public Guid ExternalEntityId { get; set; }
        public virtual ExternalEntity ExternalEntity { get; set; } = default!;

        public bool CanSend { get; set; } = false;
        public bool CanReceive { get; set; } = false;

        [StringLength(100)]
        public string? RequiresSignatureLevel { get; set; } // (مدير المديرية، وكيل، رئيس الجهاز) - Could be an enum too
    }
}
