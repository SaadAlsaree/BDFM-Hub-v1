using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;

namespace BDFM.Domain.Entities.Workflow
{
    public class RelatedPriority : AuditableEntity<Guid>
    {
        public Guid PrimaryCorrespondenceId { get; set; } // The current correspondence
        public virtual Correspondence PrimaryCorrespondence { get; set; } = default!;

        public Guid PriorityCorrespondenceId { get; set; } // The previous correspondence being linked
        public virtual Correspondence PriorityCorrespondence { get; set; } = default!;
    }
}
