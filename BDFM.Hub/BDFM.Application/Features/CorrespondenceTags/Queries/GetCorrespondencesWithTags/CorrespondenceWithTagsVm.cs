namespace BDFM.Application.Features.CorrespondenceTags.Queries.GetCorrespondencesWithTags;

public class CorrespondenceWithTagsVm
{
    // Identifiers
    public Guid CorrespondenceId { get; set; }
    public Guid WorkflowStepId { get; set; }

    // Basic correspondence properties
    public string Subject { get; set; } = string.Empty;
    public string BodyText { get; set; } = string.Empty;
    public CorrespondenceTypeEnum CorrespondenceType { get; set; }
    public CorrespondenceStatusEnum CorrespondenceStatus { get; set; }
    public string CorrespondenceTypeName { get; set; } = string.Empty; // Auto-populated
    public string CorrespondenceStatusName { get; set; } = string.Empty; // Auto-populated

    public string ExternalReferenceNumber { get; set; } = string.Empty;
    public DateTime ExternalReferenceDate { get; set; }

    public string MailNum { get; set; } = string.Empty; // e.g., "500-2025"
    public DateOnly MailDate { get; set; } // Date of the mail, not the correspondence creation date
     public string? CreatedByUserName { get; set; }
    public string? CreatedByUnitName { get; set; }
    public string? CreatedByUnitCode { get; set; }
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
    // Tags information
    public List<TagInfoDto> Tags { get; set; } = new List<TagInfoDto>();
}

public class TagInfoDto
{
    public Guid TagId { get; set; }
    public string TagName { get; set; } = string.Empty;
    public TagCategoryEnum Category { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public bool IsAll { get; set; }
    public Guid? FromUserId { get; set; }
    public UserDetailVm? FromUser { get; set; }
    public Guid? FromUnitId { get; set; }
    public OrganizationalUnitDetailVm? FromUnit { get; set; }
    public RecipientTypeEnum ToPrimaryRecipientType { get; set; }
    public string ToPrimaryRecipientTypeName { get; set; } = string.Empty;

    public Guid ToPrimaryRecipientId { get; set; }
    public string ToPrimaryRecipientName { get; set; } = string.Empty;

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