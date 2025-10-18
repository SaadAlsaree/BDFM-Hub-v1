namespace BDFM.Application.Features.Correspondences.Queries.GetReturnForEditing;

public class ReturnForEditingItemVm
{
    public Guid CorrespondenceId { get; set; }
    public Guid WorkflowStepId { get; set; }

    public string Subject { get; set; } = string.Empty;
    public CorrespondenceTypeEnum CorrespondenceType { get; set; }
    public CorrespondenceStatusEnum CorrespondenceStatus { get; set; }
    public string CorrespondenceStatusName { get; set; } = string.Empty;
    public string CorrespondenceTypeName { get; set; } = string.Empty;

    public string ExternalReferenceNumber { get; set; } = string.Empty;
    public DateTime ExternalReferenceDate { get; set; }

    public string MailNum { get; set; } = string.Empty;
    public DateOnly MailDate { get; set; }

    public PriorityLevelEnum PriorityLevel { get; set; }
    public string PriorityLevelName { get; set; } = string.Empty;
    public SecrecyLevelEnum SecrecyLevel { get; set; }
    public string SecrecyLevelName { get; set; } = string.Empty;

    public DateTime ReceivedDate { get; set; }
    public DateTime? DueDate { get; set; }

    public WorkflowStepStatus Status { get; set; }
    public string WorkflowStepStatusName { get; set; } = string.Empty;
    public string StatusName { get; set; } = string.Empty;

    public Guid? FileId { get; set; }
    public string? FileNumber { get; set; }
    public bool IsDraft { get; set; }

    public UserCorrespondenceInteractionDto UserCorrespondenceInteraction { get; set; } = new UserCorrespondenceInteractionDto();
}

public class UserCorrespondenceInteractionDto
{
    public Guid UserId { get; set; }
    public Guid CorrespondenceId { get; set; }
    public bool IsStarred { get; set; }
    public DateTime? PostponedUntil { get; set; }
    public bool IsPostponed => PostponedUntil.HasValue && PostponedUntil.Value > DateTime.UtcNow;
    public DateTime? LastReadAt { get; set; }
    public bool IsInTrash { get; set; }
    public bool IsRead { get; set; }
    public bool ReceiveNotifications { get; set; }
}
