using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Security;

namespace BDFM.Domain.Entities.Automation
{
    public class AdvancedAlertRule : AuditableEntity<Guid>
    {
        public string AlertName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public Guid CreatedByUserId { get; set; } // المستخدم الذي أنشأ قاعدة التنبيه
        public virtual User CreatedByUser { get; set; } = default!;

        // الشروط لتفعيل التنبيه (يمكن إعادة استخدام هيكل RuleCondition أو إنشاء هيكل مخصص)
        // مثال بسيط:

        public string ConditionLogic { get; set; } = string.Empty;// (e.g., "OverdueByXHours", "QueueSizeExceedsY")
        public string? ConditionParametersJson { get; set; } // (e.g., { "hours": 48 }, { "unitId": "guid", "size": 10 })

        // لمن يرسل التنبيه
        public Guid? TargetUserId { get; set; } // مستخدم معين
        public virtual User? TargetUser { get; set; }
        public Guid? TargetRoleId { get; set; } // دور معين (كل المستخدمين في هذا الدور)
        public virtual Role? TargetRole { get; set; }

        public string NotificationMessageTemplate { get; set; } = string.Empty; // قالب رسالة التنبيه
        public string NotificationChannel { get; set; } = "InApp"; // "InApp", "Email", "SMS"

        // Navigation property for trigger logs
        public virtual ICollection<AdvancedAlertTriggerLog> TriggerLogs { get; set; } = new HashSet<AdvancedAlertTriggerLog>();
    }
}
