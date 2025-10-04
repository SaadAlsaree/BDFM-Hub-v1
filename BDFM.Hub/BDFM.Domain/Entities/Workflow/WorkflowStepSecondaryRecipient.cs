using BDFM.Domain.Common;
using BDFM.Domain.Enums;

namespace BDFM.Domain.Entities.Workflow
{
    public class WorkflowStepSecondaryRecipient : AuditableEntity<Guid>
    {

        public Guid StepId { get; set; }
        public virtual WorkflowStep WorkflowStep { get; set; } = default!;

        public RecipientTypeEnum RecipientType { get; set; } // User or Unit

        public Guid RecipientId { get; set; } // UserID or UnitID
                                              // Similar to WorkflowStep, logic is needed to interpret RecipientId
        public string? Purpose { get; set; } // Text type in DB (للاطلاع، للمتابعة)
        public string? InstructionText { get; set; } // Text type in DB (هامش مخصص)
    }
}
