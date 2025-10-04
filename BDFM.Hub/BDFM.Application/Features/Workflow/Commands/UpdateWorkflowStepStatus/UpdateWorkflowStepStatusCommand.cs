namespace BDFM.Application.Features.Workflow.Commands.UpdateWorkflowStepStatus
{
    public class UpdateWorkflowStepStatusCommand : IRequest<Response<bool>>
    {
        public Guid WorkflowStepId { get; set; }
        public WorkflowStepStatus Status { get; set; } // New status to set
        public string? Comment { get; set; } // Optional comment for the status change
    }
}
