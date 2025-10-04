using BDFM.Domain.Common;

namespace BDFM.Domain.Entities.Automation
{
    public class RuleAction : AuditableEntity<Guid>
    {
        public Guid BusinessRuleId { get; set; }
        public virtual BusinessRule BusinessRule { get; set; } = default!;

        // تفاصيل الإجراء:
        public string ActionType { get; set; } = string.Empty; // e.g., "SendNotification", "EscalateCorrespondence", "ChangeStatus", "ExecuteCustomWorkflow"
        public string? ParametersJson { get; set; } // معلمات الإجراء بتنسيق JSON (e.g., { "userId": "guid", "message": "text" } for SendNotification)
        public int Order { get; set; } // ترتيب تنفيذ الإجراءات
    }
}
