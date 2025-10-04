using BDFM.Domain.Common;

namespace BDFM.Domain.Entities.Automation
{
    public class BusinessRule : AuditableEntity<Guid>
    {
        public string RuleName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public int Priority { get; set; } = 0; // لتحديد ترتيب تنفيذ القواعد المتعارضة
        // Trigger: متى يجب تقييم هذه القاعدة؟ (e.g., OnCorrespondenceCreated, OnWorkflowStepChanged, OnDueDateApproaching)
        public string TriggerEvent { get; set; } = string.Empty;// يمكن أن يكون Enum أو جدول lookup

        public virtual ICollection<RuleCondition> Conditions { get; set; } = new HashSet<RuleCondition>();
        public virtual ICollection<RuleAction> Actions { get; set; } = new HashSet<RuleAction>();
    }
}
