namespace BDFM.Application.Features.CustomWorkflows.Commands.SoftDeleteCustomWorkflow;

public class SoftDeleteCustomWorkflowCommand : IRequest<Response<bool>>
{
    public Guid Id { get; set; }
}
