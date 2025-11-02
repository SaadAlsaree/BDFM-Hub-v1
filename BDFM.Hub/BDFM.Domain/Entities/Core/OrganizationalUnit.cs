using BDFM.Domain.Common;
using BDFM.Domain.Entities.Security;
using BDFM.Domain.Entities.Supporting;
using BDFM.Domain.Entities.Workflow;
using BDFM.Domain.Enums;

namespace BDFM.Domain.Entities.Core
{
    public class OrganizationalUnit : AuditableEntity<Guid>
    {

        public string UnitName { get; set; } = string.Empty;
        [StringLength(50)] // Make unique in DB context
        public string UnitCode { get; set; } = string.Empty; // e.g., "HR", "IT", "Finance"
        public string? UnitDescription { get; set; }

        public Guid? ParentUnitId { get; set; }
        public virtual OrganizationalUnit? ParentUnit { get; set; }
        public UnitType UnitType { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? PostalCode { get; set; }
        public string? UnitLogo { get; set; } // Path to logo image

        public int? UnitLevel { get; set; }
        public bool CanReceiveExternalMail { get; set; } = false;
        public bool CanSendExternalMail { get; set; } = false;



        // Navigation Properties
        public virtual ICollection<OrganizationalUnit> ChildUnits { get; set; } = new HashSet<OrganizationalUnit>();
        public virtual ICollection<User> Users { get; set; } = new HashSet<User>();
        public virtual ICollection<UnitPermission> UnitPermissions { get; set; } = new HashSet<UnitPermission>();
        public virtual ICollection<CorrespondenceTemplate> CorrespondenceTemplates { get; set; } = new HashSet<CorrespondenceTemplate>();
        public virtual ICollection<PermittedExternalEntityCommunication> PermittedCommunications { get; set; } = new HashSet<PermittedExternalEntityCommunication>();
        public virtual ICollection<CustomWorkflow> TriggeringCustomWorkflows { get; set; } = new HashSet<CustomWorkflow>();
        public virtual ICollection<WorkflowStep> WorkflowStepsFromUnit { get; set; } = new HashSet<WorkflowStep>();
        public virtual ICollection<Tag> OrganizationalUnitTags { get; set; } = new HashSet<Tag>();
        public virtual ICollection<Correspondence> Correspondences { get; set; } = new HashSet<Correspondence>();

        // Leave Request Navigation Properties
        public virtual ICollection<LeaveRequest> LeaveRequests { get; set; } = new HashSet<LeaveRequest>();
    }
}
