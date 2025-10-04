namespace BDFM.Application.Features.Workflow.Commands.CompleteWorkflowStep
{
    public class CompleteWorkflowStepCommand : IRequest<Response<bool>>
    {
        public Guid WorkflowStepId { get; set; }
    }
}
