using BDFM.Domain.Common;

namespace BDFM.Domain.Entities.Automation
{
    public class AutomationExecutionLog : AuditableEntity<Guid>
    {
        public Guid? AutomatedProcessId { get; set; } // ID لـ CustomWorkflow أو BusinessRule
        public string AutomatedProcessType { get; set; } = string.Empty;// "CustomWorkflow", "BusinessRule"

        public Guid? TriggeringEntityId { get; set; } // ID للكيان الذي أدى للتنفيذ (e.g., CorrespondenceId, WorkflowStepId)
        public string? TriggeringEntityType { get; set; }

        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
        public TimeSpan? Duration => CompletedAt.HasValue ? CompletedAt.Value - StartedAt : (TimeSpan?)null;

        public string Status { get; set; } = string.Empty; // "Success", "Failed", "PartialSuccess"
        public string? ErrorMessage { get; set; } // إذا فشل
        public string? OutputDetailsJson { get; set; } // أي نتائج أو تفاصيل إضافية عن التنفيذ

    }
}
