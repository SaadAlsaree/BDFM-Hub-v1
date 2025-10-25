namespace BDFM.Application.Features.CustomWorkflowSteps.Commands.DeteleCustomWorkflowStep;

public class DeteleCustomWorkflowStepCommand : IRequest<Response<bool>>
{
    public Guid Id { get; set; }
}
