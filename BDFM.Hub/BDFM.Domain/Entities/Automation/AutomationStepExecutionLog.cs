using BDFM.Domain.Common;

namespace BDFM.Domain.Entities.Automation
{
    public class AutomationStepExecutionLog : AuditableEntity<Guid>
    {

        public Guid AutomationExecutionLogId { get; set; } // يربط باللوج الرئيسي
        public virtual AutomationExecutionLog AutomationExecutionLog { get; set; } = default!;

        public Guid? StepDefinitionId { get; set; } // ID لـ CustomWorkflowStep أو RuleAction/RuleCondition
        public string StepName { get; set; } = string.Empty; // اسم وصفي للخطوة
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string Status { get; set; } = string.Empty; // "Success", "Failed"
        public string? DetailsJson { get; set; }
    }
}
