namespace BDFM.Application.Features.CustomWorkflowSteps.Commands.SoftDeteleCustomWorkflowStep;

public class SoftDeteleCustomWorkflowStepCommand : IRequest<Response<bool>>
{
    public Guid Id { get; set; }
}
