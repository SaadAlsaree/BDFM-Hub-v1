namespace BDFM.Application.Features.Correspondences.Queries.GetCorrespondenceAnyWorkflowNotCompleted
{
    public class CorrespondenceWorkflowNotCompletedVm
    {
        // Identifiers
        public Guid CorrespondenceId { get; set; }
        public Guid WorkflowStepId { get; set; }

        // Basic correspondence properties
        public string Subject { get; set; } = string.Empty;
        public CorrespondenceTypeEnum CorrespondenceType { get; set; }
        public CorrespondenceStatusEnum CorrespondenceStatus { get; set; }
        public string CorrespondenceTypeName { get; set; } = string.Empty; // Auto-populated
        public string CorrespondenceStatusName { get; set; } = string.Empty; // Auto-populated

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

        public int? UnreadCount { get; set; }
        public int? PostponedUntilCount { get; set; }
        public int? InTrashCount { get; set; }
        public int? StarredCount { get; set; }
        public int? DueDateCount { get; set; }
        // File information
        public Guid? FileId { get; set; }
        public string? FileNumber { get; set; }
        public bool IsDraft { get; set; }

        // User interaction flags
        public UserCorrespondenceInteractionDto UserCorrespondenceInteraction { get; set; } = new UserCorrespondenceInteractionDto();
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
}

