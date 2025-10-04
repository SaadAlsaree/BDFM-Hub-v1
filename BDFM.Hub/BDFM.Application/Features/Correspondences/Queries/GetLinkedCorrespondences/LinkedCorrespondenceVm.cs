namespace BDFM.Application.Features.Correspondences.Queries.GetLinkedCorrespondences
{
    public class LinkedCorrespondenceVm
    {
        // Identifiers
        public Guid Id { get; set; }
        public Guid SourceCorrespondenceId { get; set; }

        // Link information
        public string LinkReason { get; set; } = string.Empty;
        public DateTime LinkedAt { get; set; }
        public Guid LinkedByUserId { get; set; }
        public string LinkedByUserName { get; set; } = string.Empty;

        // Correspondence details
        public string Subject { get; set; } = string.Empty;
        public CorrespondenceTypeEnum CorrespondenceType { get; set; }
        public string CorrespondenceTypeName { get; set; } = string.Empty;

        // References
        public string? InternalReferenceNumber { get; set; }
        public string? ExternalReferenceNumber { get; set; }

        // Status information
        public CorrespondenceStatusEnum Status { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public bool IsDraft { get; set; }
        public bool IsInTrash { get; set; }

        // Classification
        public PriorityLevelEnum PriorityLevel { get; set; }
        public string PriorityLevelName { get; set; } = string.Empty;

        // Dates
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }

        // Author info
        public Guid CreatedByUserId { get; set; }
        public string CreatedByUserName { get; set; } = string.Empty;
    }
}
