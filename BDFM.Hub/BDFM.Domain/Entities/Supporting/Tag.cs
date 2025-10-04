using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Enums;

namespace BDFM.Domain.Entities.Supporting
{
    public class Tag : AuditableEntity<Guid>
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [StringLength(7)] // For hex color codes like #FF5733
        public string? Color { get; set; }

        public TagCategoryEnum Category { get; set; } = TagCategoryEnum.General;

        public bool IsSystemTag { get; set; } = false; // System-defined vs user-defined tags

        public bool IsPublic { get; set; } = true; // Public tags vs private user tags

        // For user-specific private tags
        public Guid? CreatedByUserId { get; set; }
        public virtual User? CreatedByUser { get; set; }

        // For organizational unit specific tags
        public Guid? OrganizationalUnitId { get; set; }
        public virtual OrganizationalUnit? OrganizationalUnit { get; set; }

        public int UsageCount { get; set; } = 0; // Track how many times this tag is used

        // Navigation Properties
        public virtual ICollection<CorrespondenceTag> CorrespondenceTags { get; set; } = new HashSet<CorrespondenceTag>();
    }
}