using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Enums;

namespace BDFM.Domain.Entities.Supporting
{
    public class CustomWorkflow : AuditableEntity<Guid>
    {
        [StringLength(255)]
        public string WorkflowName { get; set; } = string.Empty;

        public Guid? TriggeringUnitId { get; set; }
        public virtual OrganizationalUnit? TriggeringUnit { get; set; }

        public CorrespondenceTypeEnum? TriggeringCorrespondenceType { get; set; }

        public string? Description { get; set; } // Text type in DB
        public bool IsEnabled { get; set; } = true;

        // Navigation Properties
        public virtual ICollection<CustomWorkflowStep> Steps { get; set; } = new HashSet<CustomWorkflowStep>();
    }
}
