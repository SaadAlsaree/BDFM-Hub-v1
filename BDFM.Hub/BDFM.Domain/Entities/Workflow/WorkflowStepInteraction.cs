using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;

namespace BDFM.Domain.Entities.Workflow
{
    public class WorkflowStepInteraction : AuditableEntity<Guid>
    {
        public Guid WorkflowStepId { get; set; } // خطوة سير العمل التي يتم التفاعل معها
        public virtual WorkflowStep WorkflowStep { get; set; } = default!;

        // من قام بالتفاعل (إما مستخدم أو وحدة ككل - على الرغم من أن الوحدة أقل شيوعًا هنا)
        public Guid? InteractingUserId { get; set; }
        public virtual User? InteractingUser { get; set; }

        // يمكنك إضافة UnitId إذا أردت تسجيل تفاعل على مستوى الوحدة، لكن User هو الأهم للقراءة
        // public Guid? InteractingUnitId { get; set; }
        // [ForeignKey("InteractingUnitId")]
        // public virtual OrganizationalUnit? InteractingUnit { get; set; }

        public bool IsRead { get; set; } = false; // حالة القراءة لهذا المستخدم لهذه الخطوة
        public DateTime? ReadAt { get; set; } // وقت القراءة

        // يمكن إضافة حقول تفاعلات أخرى في المستقبل
        // public bool IsArchivedByUser { get; set; } // (مثال)

        // لضمان عدم تكرار سجل التفاعل لنفس المستخدم ونفس الخطوة
        // يجب إضافة Unique constraint على (WorkflowStepId, InteractingUserId)
        // يتم ذلك في DbContext باستخدام OnModelCreating
    }
}
