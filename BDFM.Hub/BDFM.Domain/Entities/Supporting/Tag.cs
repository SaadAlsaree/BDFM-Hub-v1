using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Enums;

namespace BDFM.Domain.Entities.Supporting
{
    public class Tag : AuditableEntity<Guid>
    {
        // Correspondence-specific tags
        public Guid CorrespondenceId { get; set; }
        public virtual Correspondence? Correspondence { get; set; }

        public string? Name { get; set; } = string.Empty;

        public TagCategoryEnum Category { get; set; } = TagCategoryEnum.General;

        public bool? IsAll { get; set; } = false;

        // For user-specific private tags
         public Guid? FromUserId { get; set; }
        public virtual User? FromUser { get; set; }

        public Guid? FromUnitId { get; set; }
        public virtual OrganizationalUnit? FromUnit { get; set; }

        public RecipientTypeEnum? ToPrimaryRecipientType { get; set; }

        public Guid? ToPrimaryRecipientId { get; set; }


        // Navigation Properties
        public virtual ICollection<CorrespondenceTag> CorrespondenceTags { get; set; } = new HashSet<CorrespondenceTag>();
    }
}