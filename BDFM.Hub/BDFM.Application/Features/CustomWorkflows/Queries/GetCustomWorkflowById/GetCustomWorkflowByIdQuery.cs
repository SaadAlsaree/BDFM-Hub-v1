namespace BDFM.Application.Features.CustomWorkflows.Queries.GetCustomWorkflowById;

public class GetCustomWorkflowByIdQuery : IRequest<Response<GetCustomWorkflowByIdVm>>
{
    public Guid Id { get; set; }
}
