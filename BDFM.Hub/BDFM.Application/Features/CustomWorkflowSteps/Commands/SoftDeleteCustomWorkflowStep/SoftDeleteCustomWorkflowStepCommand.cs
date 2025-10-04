namespace BDFM.Application.Features.CustomWorkflowSteps.Commands.SoftDeleteCustomWorkflowStep;

public class SoftDeleteCustomWorkflowStepCommand : IRequest<Response<bool>>
{
    public Guid Id { get; set; }
}
