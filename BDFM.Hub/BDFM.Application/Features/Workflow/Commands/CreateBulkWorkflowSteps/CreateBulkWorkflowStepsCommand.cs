namespace BDFM.Application.Features.Workflow.Commands.CreateBulkWorkflowSteps
{
    public class CreateBulkWorkflowStepsCommand : IRequest<Response<bool>>
    {
        public Guid CorrespondenceId { get; set; }
        public List<WorkflowStepItem> WorkflowSteps { get; set; } = new();
    }

    public class WorkflowStepItem
    {
        public ActionTypeEnum ActionType { get; set; }
        public RecipientTypeEnum ToPrimaryRecipientType { get; set; }
        public Guid ToPrimaryRecipientId { get; set; }
        public string? InstructionText { get; set; }
        public DateTime? DueDate { get; set; }
        public WorkflowStepStatus Status { get; set; } = WorkflowStepStatus.Pending;
        public bool IsTimeSensitive { get; set; } = false;
        public int Sequence { get; set; }
        public bool IsActive { get; set; }
    }
}
