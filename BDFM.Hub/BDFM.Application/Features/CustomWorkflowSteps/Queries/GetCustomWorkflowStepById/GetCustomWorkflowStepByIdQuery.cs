namespace BDFM.Application.Features.CustomWorkflowSteps.Queries.GetCustomWorkflowStepById;
using MediatR;

public class GetCustomWorkflowStepByIdQuery : IRequest<Response<GetCustomWorkflowStepByIdVm>>
{
    public Guid Id { get; set; }
}
