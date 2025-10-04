namespace BDFM.Application.Features.CustomWorkflows.Commands.CreateCustomWorkflow;

public class CreateCustomWorkflowCommand : IRequest<Response<Guid>>
{
    public string WorkflowName { get; set; } = string.Empty;
    public Guid? TriggeringUnitId { get; set; }
    public CorrespondenceTypeEnum? TriggeringCorrespondenceType { get; set; }
    public string? Description { get; set; } // Text type in DB
    public bool IsEnabled { get; set; } = true;
}
