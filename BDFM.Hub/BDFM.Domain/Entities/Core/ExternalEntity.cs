using BDFM.Domain.Common;
using BDFM.Domain.Entities.Supporting;
using BDFM.Domain.Enums;


namespace BDFM.Domain.Entities.Core;

public class ExternalEntity : AuditableEntity<Guid>
{

    public string EntityName { get; set; } = string.Empty;
    public string EntityCode { get; set; } = string.Empty; // Unique code for the entity, if applicable

    public EntityType? EntityType { get; set; } // (وزارة، هيئة، شركة، الخ)

    public string? ContactInfo { get; set; } // Text type in DB

    // Navigation Properties
    public virtual ICollection<PermittedExternalEntityCommunication> PermittedCommunications { get; set; } = new HashSet<PermittedExternalEntityCommunication>();
    public virtual ICollection<Correspondence> Correspondences { get; set; } = new HashSet<Correspondence>();
    // If ExternalEntity can be a direct recipient in a workflow step, add navigation here
    // public virtual ICollection<WorkflowStep> WorkflowStepsTargetingEntity { get; set; } = new HashSet<WorkflowStep>();
}