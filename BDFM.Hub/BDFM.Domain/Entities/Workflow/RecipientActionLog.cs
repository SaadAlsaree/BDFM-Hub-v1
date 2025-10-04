using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Enums;

namespace BDFM.Domain.Entities.Workflow
{
    public class RecipientActionLog : AuditableEntity<Guid>
    {
        public Guid WorkflowStepId { get; set; } // يربط هذا الإجراء بخطوة الإحالة الأصلية
        public virtual WorkflowStep WorkflowStep { get; set; } = default!;

        // الجهة التي قامت بالإجراء الداخلي (عادة هي المستلمة في WorkflowStep)
        public Guid? ActionTakenByUnitId { get; set; }
        public virtual OrganizationalUnit? ActionTakenByUnit { get; set; }

        public Guid? ActionTakenByUserId { get; set; } // الموظف المحدد داخل الوحدة الذي قام بالإجراء
        public virtual User? ActionTakenByUser { get; set; } // وهذا الـ navigation property

        public DateTime ActionTimestamp { get; set; } = DateTime.UtcNow;

        public string ActionDescription { get; set; } = default!; // وصف الإجراء (مثال: "أحيل إلى قسم الموارد البشرية داخليًا", "قيد إعداد المسودة")

        public string? Notes { get; set; } // ملاحظات إضافية

        // يمكن إضافة حقول أخرى مثل نوع الإجراء الداخلي، حالة الإجراء الداخلي، إلخ.
        public InternalActionTypeEnum InternalActionType { get; set; }
    }
}
