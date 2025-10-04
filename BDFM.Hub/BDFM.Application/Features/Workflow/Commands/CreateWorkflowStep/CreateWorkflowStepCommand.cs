namespace BDFM.Application.Features.Workflow.Commands.CreateWorkflowStep
{
    public class CreateWorkflowStepCommand : IRequest<Response<bool>>
    {
        public Guid CorrespondenceId { get; set; }
        public ActionTypeEnum ActionType { get; set; }
        public RecipientTypeEnum ToPrimaryRecipientType { get; set; }
        public Guid ToPrimaryRecipientId { get; set; }
        public string? InstructionText { get; set; } // Text type in DB
        public DateTime? DueDate { get; set; }
        public WorkflowStepStatus Status { get; set; } = WorkflowStepStatus.Pending;
        public bool IsTimeSensitive { get; set; } = false;
    }
}
