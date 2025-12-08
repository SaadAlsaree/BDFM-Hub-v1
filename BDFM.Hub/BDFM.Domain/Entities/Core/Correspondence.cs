using BDFM.Domain.Common;
using BDFM.Domain.Entities.Supporting;
using BDFM.Domain.Entities.Workflow;
using BDFM.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDFM.Domain.Entities.Core
{
    public class Correspondence : AuditableEntity<Guid>
    {
        public Guid? FileId { get; set; }
        public virtual MailFile? MailFile { get; set; }

        public CorrespondenceTypeEnum CorrespondenceType { get; set; }

        [StringLength(255)]
        public string? ExternalReferenceNumber { get; set; }
        public DateOnly? ExternalReferenceDate { get; set; }

        public string MailNum { get; set; } = string.Empty; // e.g., "500-2025"
        public DateOnly MailDate { get; set; } // Date of the mail, not the correspondence creation date

        public string Subject { get; set; } = string.Empty; // Text type in DB
        public string? BodyText { get; set; } // LongText type in DB

        public SecrecyLevelEnum SecrecyLevel { get; set; } = SecrecyLevelEnum.None;
        public PriorityLevelEnum PriorityLevel { get; set; } = PriorityLevelEnum.Normal;
        public PersonalityLevelEnum PersonalityLevel { get; set; } = PersonalityLevelEnum.General;

        public Guid? CorrespondenceOrganizationalUnitId { get; set; }
        public virtual OrganizationalUnit? CorrespondenceOrganizationalUnit { get; set; }

        public CorrespondenceStatusEnum Status { get; set; } = CorrespondenceStatusEnum.PendingReferral;

        public Guid? SignatoryUserId { get; set; }

        public string? OcrText { get; set; } // LongText type in DB
        public bool IsDraft { get; set; } = true;
        public DateTime? FinalizedAt { get; set; }
        public Guid? ExternalEntityId { get; set; }

        public Guid? CreateByUserId { get; set; }
        public virtual User? CreateByUser { get; set; }

        // Navigation Properties
        public virtual ICollection<WorkflowStep> WorkflowSteps { get; set; } = new HashSet<WorkflowStep>();
        public virtual ICollection<RelatedPriority> PrimaryRelatedPriorities { get; set; } = new HashSet<RelatedPriority>(); // Where this is the primary
        public virtual ICollection<RelatedPriority> PriorityRelatedCorrespondences { get; set; } = new HashSet<RelatedPriority>(); // Where this is the priority
        public virtual ICollection<DraftVersion> DraftVersions { get; set; } = new HashSet<DraftVersion>();
        public virtual ICollection<Correspondence> RepliesToThis { get; set; } = new HashSet<Correspondence>(); // For self-referencing replies
        public virtual ICollection<Notification> Notifications { get; set; } = new HashSet<Notification>();
        public virtual ExternalEntity? ExternalEntity { get; set; }
        // المراسلات التي تشير إليها هذه الكتاب (هذه هي المراسلات السابقة)
        [InverseProperty("SourceCorrespondence")] // يحدد أي طرف من CorrespondenceLink يمثل هذه العلاقة
        public virtual ICollection<CorrespondenceLink> ReferencesTo { get; set; } = new HashSet<CorrespondenceLink>();
        // المراسلات التي تشير إلى هذه الكتاب (هذه هي المراسلات اللاحقة التي أشارت لهذه)
        [InverseProperty("LinkedCorrespondence")] // يحدد أي طرف من CorrespondenceLink يمثل هذه العلاقة
        public virtual ICollection<CorrespondenceLink> ReferencedBy { get; set; } = new HashSet<CorrespondenceLink>();
        public virtual ICollection<UserCorrespondenceInteraction> UserCorrespondenceInteractions { get; set; } = new HashSet<UserCorrespondenceInteraction>();
        public virtual ICollection<CorrespondenceComment> Comments { get; set; } = new HashSet<CorrespondenceComment>();
        public virtual ICollection<Tag> Tags { get; set; } = new HashSet<Tag>();
        public virtual ICollection<CorrespondenceTimeline> CorrespondenceTimelines { get; set; } = new HashSet<CorrespondenceTimeline>();
    }
}
