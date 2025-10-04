using BDFM.Domain.Common;

namespace BDFM.Domain.Entities.Automation
{
    public class RuleCondition : AuditableEntity<Guid>
    {
        public Guid BusinessRuleId { get; set; }
        public virtual BusinessRule BusinessRule { get; set; } = default!;

        // تفاصيل الشرط:
        public string FieldName { get; set; } = string.Empty;// اسم الحقل في الكيان المراد تقييمه (e.g., "Correspondence.PriorityLevel", "WorkflowStep.Status")
        public string Operator { get; set; } = string.Empty; // e.g., "Equals", "GreaterThan", "Contains", "IsDueInXDays" (يتطلب تفسير خاص)
        public string Value { get; set; } = string.Empty; // القيمة المراد مقارنتها (قد تحتاج لتحويل النوع)
        public string? LogicalOperatorWithNext { get; set; } // "AND", "OR" (إذا كان هناك شروط متعددة)
        public int Order { get; set; } // ترتيب تقييم الشروط
    }
}
