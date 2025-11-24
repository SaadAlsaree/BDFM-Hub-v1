namespace BDFM.Application.Features.Correspondences.Queries.GetForwardedCorrespondence;

public class GetForwardedCorrespondenceVm

{
    // Identifiers
    public Guid CorrespondenceId { get; set; }
    public Guid WorkflowStepId { get; set; }

    // Basic correspondence properties
    public string Subject { get; set; } = string.Empty;
    public CorrespondenceTypeEnum CorrespondenceType { get; set; }
    public CorrespondenceStatusEnum CorrespondenceStatus { get; set; }
    public string CorrespondenceStatusName { get; set; } = string.Empty; // Auto-populated
    public string CorrespondenceTypeName { get; set; } = string.Empty; // Auto-populated

    public string ExternalReferenceNumber { get; set; } = string.Empty;
    public DateTime ExternalReferenceDate { get; set; }

    public string MailNum { get; set; } = string.Empty; // e.g., "500-2025"
    public DateOnly MailDate { get; set; } // Date of the mail, not the correspondence creation date
    public string CreatedByUnitName { get; set; } = string.Empty;
    // Classification levels
    public PriorityLevelEnum PriorityLevel { get; set; }
    public string PriorityLevelName { get; set; } = string.Empty; // Auto-populated
    public SecrecyLevelEnum SecrecyLevel { get; set; }
    public string SecrecyLevelName { get; set; } = string.Empty; // Auto-populated

    // Dates
    public DateTime ReceivedDate { get; set; } // From WorkflowStep.CreatedAt
    public DateTime? DueDate { get; set; } // Optional due date from workflow step

    // Status indicators
    public WorkflowStepStatus Status { get; set; }
    public string WorkflowStepStatusName { get; set; } = string.Empty;
    public string StatusName { get; set; } = string.Empty; // Auto-populated

    // File information
    public Guid? FileId { get; set; }
    public string? FileNumber { get; set; }
    public bool IsDraft { get; set; }


    // User interaction flags
    public UserCorrespondenceInteractionDto UserCorrespondenceInteraction { get; set; } = new UserCorrespondenceInteractionDto();
    public List<WorkflowStepVm> WorkflowSteps { get; set; } = new List<WorkflowStepVm>();

}



public class UserCorrespondenceInteractionDto
{
    public Guid UserId { get; set; }
    public Guid CorrespondenceId { get; set; }
    public bool IsStarred { get; set; } = false;
    public DateTime? PostponedUntil { get; set; } // ?????? ?????? (Snoozed/Postponed)
    public bool IsPostponed => PostponedUntil.HasValue && PostponedUntil.Value > DateTime.UtcNow;
    public DateTime? LastReadAt { get; set; } // ????? ??? ?????
    public bool IsInTrash { get; set; } = false; // ?? ???????? ?? ????????
    public bool IsRead { get; set; }
    public bool ReceiveNotifications { get; set; } = false;

}

public class WorkflowStepVm
{
        public Guid Id { get; set; }
        public Guid CorrespondenceId { get; set; }

        public ActionTypeEnum ActionType { get; set; }
        public string ActionTypeName { get; set; } = string.Empty;
        public Guid? FromUserId { get; set; }
        public Guid? FromUnitId { get; set; }
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

}
