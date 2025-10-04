using BDFM.Domain.Common;
using BDFM.Domain.Enums;

namespace BDFM.Domain.Entities.Supporting
{
    /// <summary>
    /// Defines templates for system tags that can be automatically created
    /// </summary>
    public class SystemTagTemplate : AuditableEntity<Guid>
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [StringLength(7)] // For hex color codes like #FF5733
        public string? DefaultColor { get; set; }

        public TagCategoryEnum Category { get; set; } = TagCategoryEnum.General;

        public bool IsAutoCreateEnabled { get; set; } = true; // Whether to auto-create this tag

        public int SortOrder { get; set; } = 0; // For ordering in UI

        // Localization support
        [StringLength(100)]
        public string? NameAr { get; set; } // Arabic name

        [StringLength(500)]
        public string? DescriptionAr { get; set; } // Arabic description

        public bool IsActive { get; set; } = true;
    }
}