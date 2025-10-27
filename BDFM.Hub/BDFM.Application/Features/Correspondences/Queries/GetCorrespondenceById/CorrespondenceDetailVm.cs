namespace BDFM.Application.Features.Correspondences.Queries.GetCorrespondenceById
{
    public class CorrespondenceDetailVm
    {
        // Basic correspondence properties
        public Guid Id { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string? BodyText { get; set; }
        public CorrespondenceTypeEnum CorrespondenceType { get; set; }
        public string CorrespondenceTypeName { get; set; } = string.Empty; // Auto-populated from CorrespondenceType enum
        public CorrespondenceStatusEnum CorrespondenceStatus { get; set; }
        public string CorrespondenceStatusName { get; set; } = string.Empty; // Auto-populated from Status enum
        public bool IsDraft { get; set; }
        public string StatusName { get; set; } = string.Empty; // Auto-populated from Status enum
        public string MailNum { get; set; } = string.Empty; // e.g., "500-2025"
        public DateOnly MailDate { get; set; } // Date of the mail, not the correspondence creation date


        // File information
        public Guid? FileId { get; set; }
        public string? MailFileNumber { get; set; }
        public string? MailFileSubject { get; set; }

        // Classification levels
        public SecrecyLevelEnum SecrecyLevel { get; set; }
        public string SecrecyLevelName { get; set; } = string.Empty; // Auto-populated
        public PriorityLevelEnum PriorityLevel { get; set; }
        public string PriorityLevelName { get; set; } = string.Empty; // Auto-populated
        public PersonalityLevelEnum PersonalityLevel { get; set; }
        public string PersonalityLevelName { get; set; } = string.Empty; // Auto-populated


        // Creation and modification info
        public Guid CreatedByUserId { get; set; }
        public string CreatedByUserName { get; set; } = string.Empty;
        public string CreatedByUnitName { get; set; } = string.Empty;
        public string CreatedByUnitCode { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public Guid? SignatoryUserId { get; set; }
        public string? SignatoryUserName { get; set; }
        public DateTime? FinalizedAt { get; set; }

        // External entity info (for incoming/outgoing external mails)
        public Guid? ExternalEntityId { get; set; }
        public string? ExternalEntityName { get; set; }
        public string? ExternalEntityCode { get; set; }


        public UserCorrespondenceInteractionDto UserCorrespondenceInteraction { get; set; } = new UserCorrespondenceInteractionDto();

        // Workflow steps and history
        public List<WorkflowStepHistoryVm> WorkflowSteps { get; set; } = new List<WorkflowStepHistoryVm>();

        // Linked correspondences
        public List<LinkedCorrespondenceInfoVm> ReferencesToCorrespondences { get; set; } = new List<LinkedCorrespondenceInfoVm>();
        public List<LinkedCorrespondenceInfoVm> ReferencedByCorrespondences { get; set; } = new List<LinkedCorrespondenceInfoVm>();

        // Additional user-specific interactions
        public bool IsStarredByCurrentUser { get; set; }
        public DateTime? PostponedUntil { get; set; }
        public bool IsInTrash { get; set; }
        public DateTime? DeletedAt { get; set; }

        // OCR text (if available)
        public string? OcrText { get; set; }
    }



    public class WorkflowStepHistoryVm
    {
        public Guid Id { get; set; }
        public Guid CorrespondenceId { get; set; }

        public ActionTypeEnum ActionType { get; set; }
        public string ActionTypeName { get; set; } = string.Empty;
        public Guid? FromUserId { get; set; }
        public UserDetailVm? FromUser { get; set; }
        public Guid? FromUnitId { get; set; }
        public OrganizationalUnitDetailVm? FromUnit { get; set; }
        public RecipientTypeEnum ToPrimaryRecipientType { get; set; }
        public string ToPrimaryRecipientTypeName { get; set; } = string.Empty;
        public int Sequence { get; set; }
        public bool IsActive { get; set; }

        public Guid ToPrimaryRecipientId { get; set; }
        public string ToPrimaryRecipientName { get; set; } = string.Empty;
        public string? InstructionText { get; set; } // Text type in DB
        public DateTime? DueDate { get; set; }
        public WorkflowStepStatus Status { get; set; }
        public string WorkflowStepStatusName { get; set; } = string.Empty;
        public bool IsTimeSensitive { get; set; }
        public DateTime CreateAt { get; set; }
        public Guid CreateBy { get; set; }


        // Navigation Properties
        public virtual ICollection<SecondaryRecipientVm> SecondaryRecipients { get; set; } = new HashSet<SecondaryRecipientVm>();
        public virtual ICollection<NotificationVm> Notifications { get; set; } = new HashSet<NotificationVm>();
        public virtual ICollection<WorkflowStepInteractionVm> Interactions { get; set; } = new HashSet<WorkflowStepInteractionVm>();
        public virtual ICollection<RecipientActionLogVm> RecipientActions { get; set; } = new HashSet<RecipientActionLogVm>();
        public virtual ICollection<WorkflowStepTodoVm> WorkflowStepTodos { get; set; } = new HashSet<WorkflowStepTodoVm>();
        // User interaction flags

    }

    public class SecondaryRecipientVm
    {
        public Guid Id { get; set; }
        public Guid RecipientId { get; set; }
        public RecipientTypeEnum RecipientType { get; set; }
        public string RecipientName { get; set; } = string.Empty;
        public string? InstructionText { get; set; }
        public string? Purpose { get; set; }
    }

    public class NotificationVm
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; } // User receiving notification
        public string UserName { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;// Text type in DB

        public bool IsRead { get; set; } = false;
        public NotificationTypeEnum NotificationType { get; set; }
    }

    public class WorkflowStepInteractionVm
    {
        public Guid Id { get; set; }
        public RecipientTypeEnum RecipientType { get; set; } // User or Unit
        public string RecipientTypeName { get; set; } = string.Empty;
        public Guid RecipientId { get; set; } // UserID or UnitID
                                              // Similar to WorkflowStep, logic is needed to interpret RecipientId
        public string? Purpose { get; set; } // Text type in DB (للاطلاع، للمتابعة)
        public string? InstructionText { get; set; } // Text type in DB (هامش مخصص)
    }

    public class RecipientActionLogVm
    {
        public Guid Id { get; set; }
        public string ActionDescription { get; set; } = string.Empty;
        public DateTime ActionTimestamp { get; set; }
        public Guid? ActionTakenByUserId { get; set; }
        public InternalActionTypeEnum InternalActionTypeEnum { get; set; }
        public string InternalActionTypeEnumName { get; set; } = string.Empty;
        public string ActionTakenByUserName { get; set; } = string.Empty;
        public Guid? ActionTakenByUnitId { get; set; }
        public string? ActionTakenByUnitName { get; set; }
        public string? Notes { get; set; }
    }

    public class LinkedCorrespondenceInfoVm
    {
        public Guid LinkId { get; set; }
        public CorrespondenceLinkType LinkType { get; set; }
        public string LinkTypeName { get; set; } = string.Empty; // Auto-populated
        public Guid TargetCorrespondenceId { get; set; }
        public string TargetSubject { get; set; } = string.Empty;
        public string? TargetRefNo { get; set; } // Either Internal or External ref no
        public string Direction { get; set; } = string.Empty; // "To" or "From"
        public string? Notes { get; set; }
    }

    public class OrganizationalUnitDetailVm
    {
        public string UnitName { get; set; } = string.Empty;
        public string UnitCode { get; set; } = string.Empty; // e.g., "HR", "IT", "Finance"
        public string? UnitDescription { get; set; }

    }

    public class UserDetailVm
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string UserLogin { get; set; } = string.Empty;
        public Guid OrganizationalUnitId { get; set; }
        public string OrganizationalUnitName { get; set; } = string.Empty;
        public string OrganizationalUnitCode { get; set; } = string.Empty;
    }


    public class UserCorrespondenceInteractionDto
    {
        public Guid UserId { get; set; }
        public Guid CorrespondenceId { get; set; }
        public bool IsStarred { get; set; } = false;
        public DateTime? PostponedUntil { get; set; } // للبريد المؤجل (Snoozed/Postponed)
        public bool IsPostponed => PostponedUntil.HasValue && PostponedUntil.Value > DateTime.UtcNow;
        public DateTime? LastReadAt { get; set; } // تاريخ آخر قراءة
        public bool IsInTrash { get; set; } = false; // هل الكتاب في المهملات
        public bool IsRead { get; set; }
        public bool ReceiveNotifications { get; set; } = false;

    }

    public class WorkflowStepTodoVm
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsCompleted { get; set; } = false;
        public DateTime? DueDate { get; set; }
        public string? Notes { get; set; }
        public DateTime CreateAt { get; set; }

    }
}
