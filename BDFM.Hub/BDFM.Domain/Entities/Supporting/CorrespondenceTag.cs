using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDFM.Domain.Entities.Supporting
{
    public class CorrespondenceTag : AuditableEntity<Guid>
    {
        [Required]
        public Guid CorrespondenceId { get; set; }
        [ForeignKey("CorrespondenceId")]
        public virtual Correspondence Correspondence { get; set; } = default!;

        [Required]
        public Guid TagId { get; set; }
        [ForeignKey("TagId")]
        public virtual Tag Tag { get; set; } = default!;

        // Who applied this tag to this correspondence
        [Required]
        public Guid AppliedByUserId { get; set; }
        [ForeignKey("AppliedByUserId")]
        public virtual User AppliedByUser { get; set; } = default!;

        // Optional: Tag-specific metadata for this correspondence
        [StringLength(500)]
        public string? Notes { get; set; }

        // For user-specific tag applications (private tagging)
        public bool IsPrivateTag { get; set; } = false;

        // Priority/weight of this tag for this correspondence (for sorting)
        public int Priority { get; set; } = 0;
    }
}