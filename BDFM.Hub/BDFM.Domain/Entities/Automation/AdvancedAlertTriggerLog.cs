using BDFM.Domain.Common;

namespace BDFM.Domain.Entities.Automation
{
    public class AdvancedAlertTriggerLog : AuditableEntity<Guid>
    {
        public Guid AdvancedAlertRuleId { get; set; }
        public virtual AdvancedAlertRule AdvancedAlertRule { get; set; } = default!;
        public DateTime TriggeredAt { get; set; } = DateTime.UtcNow;
        public Guid? RelatedEntityId { get; set; } // (e.g., CorrespondenceId that triggered the alert)
        public string? Details { get; set; }
    }
}
