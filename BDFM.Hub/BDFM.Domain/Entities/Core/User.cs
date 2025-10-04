using BDFM.Domain.Common;
using BDFM.Domain.Entities.Security;
using BDFM.Domain.Entities.Supporting;
using BDFM.Domain.Entities.Workflow;

namespace BDFM.Domain.Entities.Core
{
    public class User : AuditableEntity<Guid>
    {
        public string Username { get; set; } = string.Empty;
        public string UserLogin { get; set; } = string.Empty;

        [StringLength(255)] // Store hash, not plain password
        public string PasswordHash { get; set; } = string.Empty;

        [StringLength(255)]
        public string FullName { get; set; } = string.Empty;

        [StringLength(255)]
        [EmailAddress]
        public string? Email { get; set; }

        public Guid? OrganizationalUnitId { get; set; }
        public virtual OrganizationalUnit? OrganizationalUnit { get; set; }

        [StringLength(255)]
        public string? PositionTitle { get; set; }

        [StringLength(100)]
        public string? RfidTagId { get; set; } // Make sure it's unique in DB context

        public bool IsActive { get; set; } = true;

        [StringLength(255)]
        public string? TwoFactorSecret { get; set; }
        public DateTime? LastLogin { get; set; }


        // Navigation Properties
        public virtual ICollection<UserRole> UserRoles { get; set; } = new HashSet<UserRole>();
        public virtual ICollection<UserPermission> UserPermissions { get; set; } = new HashSet<UserPermission>();
        public virtual ICollection<Correspondence> CreatedCorrespondences { get; set; } = new HashSet<Correspondence>();
        public virtual ICollection<Correspondence> SignedCorrespondences { get; set; } = new HashSet<Correspondence>();
        public virtual ICollection<WorkflowStep> InitiatedWorkflowSteps { get; set; } = new HashSet<WorkflowStep>();
        public virtual ICollection<DraftVersion> DraftVersionsChangedBy { get; set; } = new HashSet<DraftVersion>();
        public virtual ICollection<Delegation> DelegationsGiven { get; set; } = new HashSet<Delegation>();
        public virtual ICollection<Delegation> DelegationsReceived { get; set; } = new HashSet<Delegation>();
        public virtual ICollection<AuditLog> AuditLogs { get; set; } = new HashSet<AuditLog>();
        public virtual ICollection<Notification> Notifications { get; set; } = new HashSet<Notification>();
        public virtual ICollection<CorrespondenceTemplate> CreatedCorrespondenceTemplates { get; set; } = new HashSet<CorrespondenceTemplate>();
        public virtual ICollection<RelatedPriority> AddedRelatedPriorities { get; set; } = new HashSet<RelatedPriority>();
        public virtual ICollection<MailFile> CreatedMailFiles { get; set; } = new HashSet<MailFile>();
        public virtual ICollection<UserCorrespondenceInteraction> UserCorrespondenceInteractions { get; set; } = new HashSet<UserCorrespondenceInteraction>();
        public virtual ICollection<CorrespondenceComment> CreatedComments { get; set; } = new HashSet<CorrespondenceComment>();
        public virtual ICollection<Tag> CreatedTags { get; set; } = new HashSet<Tag>();
        public virtual ICollection<CorrespondenceTag> AppliedCorrespondenceTags { get; set; } = new HashSet<CorrespondenceTag>();

    }
}
