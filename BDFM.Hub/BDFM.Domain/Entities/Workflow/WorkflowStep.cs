using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Supporting;
using BDFM.Domain.Enums;

namespace BDFM.Domain.Entities.Workflow
{
    public class WorkflowStep : AuditableEntity<Guid>
    {
        public Guid CorrespondenceId { get; set; }
        public virtual Correspondence Correspondence { get; set; } = default!;

        public ActionTypeEnum ActionType { get; set; }

        public Guid? FromUserId { get; set; }
        public virtual User? FromUser { get; set; }

        public Guid? FromUnitId { get; set; }
        public virtual OrganizationalUnit? FromUnit { get; set; }

        public RecipientTypeEnum ToPrimaryRecipientType { get; set; }

        public Guid ToPrimaryRecipientId { get; set; }
        // UserID, UnitID, or ExternalEntityID
        // Note: You'll need application logic to correctly interpret ToPrimaryRecipientId
        // based on ToPrimaryRecipientType. EF Core won't create direct navigation properties
        // for this polymorphic association easily. You might have nullable FKs instead:
        // public Guid? ToPrimaryUserId { get; set; } ... ToPrimaryUnitId ... ToPrimaryExternalEntityId

        public string? InstructionText { get; set; } // Text type in DB
        public DateTime? DueDate { get; set; }
        public WorkflowStepStatus Status { get; set; } = WorkflowStepStatus.Pending;
        public bool IsTimeSensitive { get; set; } = false;

        // Navigation Properties
        public virtual ICollection<WorkflowStepSecondaryRecipient> SecondaryRecipients { get; set; } = new HashSet<WorkflowStepSecondaryRecipient>();
        public virtual ICollection<Notification> Notifications { get; set; } = new HashSet<Notification>();
        public virtual ICollection<WorkflowStepInteraction> Interactions { get; set; } = new HashSet<WorkflowStepInteraction>();
        public virtual ICollection<RecipientActionLog> RecipientActions { get; set; } = new HashSet<RecipientActionLog>();
        public virtual ICollection<CorrespondenceComment> Comments { get; set; } = new HashSet<CorrespondenceComment>();
        public virtual ICollection<WorkflowStepTodo> Todos { get; set; } = new HashSet<WorkflowStepTodo>();
    }
}