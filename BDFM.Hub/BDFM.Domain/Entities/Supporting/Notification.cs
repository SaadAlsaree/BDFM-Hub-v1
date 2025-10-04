using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Workflow;
using BDFM.Domain.Enums;

namespace BDFM.Domain.Entities.Supporting
{
    public class Notification : AuditableEntity<Guid>
    {
        public Guid UserId { get; set; } // User receiving notification
        public virtual User User { get; set; } = default!;

        public string Message { get; set; } = string.Empty;// Text type in DB

        public Guid? LinkToCorrespondenceId { get; set; }
        public virtual Correspondence? LinkToCorrespondence { get; set; }

        public Guid? LinkToWorkflowStepId { get; set; }
        public virtual WorkflowStep? LinkToWorkflowStep { get; set; }
        public bool IsRead { get; set; } = false;
        public NotificationTypeEnum NotificationType { get; set; } = NotificationTypeEnum.StatusUpdate;
    }
}
