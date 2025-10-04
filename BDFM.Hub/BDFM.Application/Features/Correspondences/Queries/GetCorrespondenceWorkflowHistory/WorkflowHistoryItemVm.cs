namespace BDFM.Application.Features.Correspondences.Queries.GetCorrespondenceWorkflowHistory
{
    public class WorkflowHistoryItemVm
    {
        // Step identification
        public Guid Id { get; set; }
        public Guid CorrespondenceId { get; set; }

        // Action information
        public RecipientTypeEnum ActionType { get; set; }
        public string ActionTypeName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        // Status information
        public WorkflowStepStatus Status { get; set; }
        public string StatusName { get; set; } = string.Empty;

        // User information - From
        public Guid FromUserId { get; set; }
        public string FromUserName { get; set; } = string.Empty;
        public Guid? FromUnitId { get; set; }
        public string? FromUnitName { get; set; }

        // Recipient information - To (Primary)
        public Guid? ToPrimaryRecipientId { get; set; }
        public string? ToPrimaryRecipientName { get; set; }
        public RecipientTypeEnum ToPrimaryRecipientType { get; set; }
        public string ToPrimaryRecipientTypeName { get; set; } = string.Empty;

        // Secondary recipients (if applicable)
        public bool HasSecondaryRecipients { get; set; }
        public string? SecondaryRecipientsCount { get; set; }

        // Instructions and comments
        public string? InstructionText { get; set; }
        public string? ResponseComments { get; set; }

        // Timestamps
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? DueDate { get; set; }
        public bool IsOverdue { get; set; }

        // Tracking
        public int SequenceNumber { get; set; }
        public bool IsCurrentStep { get; set; }
    }
}
