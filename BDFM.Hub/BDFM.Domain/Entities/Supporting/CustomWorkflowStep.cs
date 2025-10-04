using BDFM.Domain.Common;
using BDFM.Domain.Enums;

namespace BDFM.Domain.Entities.Supporting
{
    public class CustomWorkflowStep : AuditableEntity<Guid>
    {
        public Guid WorkflowId { get; set; }
        public virtual CustomWorkflow CustomWorkflow { get; set; } = default!;

        public int StepOrder { get; set; }

        public ActionTypeEnum ActionType { get; set; }

        public CustomWorkflowTargetTypeEnum TargetType { get; set; }

        [StringLength(255)]
        public string? TargetIdentifier { get; set; } // UserID, UnitID, RoleName, etc.
        public string? DefaultInstructionText { get; set; } // Text type in DB
        public int? DefaultDueDateOffsetDays { get; set; } // In days from previous step
    }
}
