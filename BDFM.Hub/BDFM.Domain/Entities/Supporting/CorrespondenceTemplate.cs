using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;

namespace BDFM.Domain.Entities.Supporting
{
    public class CorrespondenceTemplate : AuditableEntity<Guid>
    {
        [StringLength(255)]
        public string TemplateName { get; set; } = string.Empty;

        public string Subject { get; set; } = string.Empty; // Text type in DB
        public string? BodyText { get; set; } // LongText type in DB

        public Guid? OrganizationalUnitId { get; set; } // If specific to a unit
        public virtual OrganizationalUnit? OrganizationalUnit { get; set; }

    }
}
