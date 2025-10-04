namespace BDFM.Application.Features.WorkflowTodo.Queries.GetWorkflowTodoByWorkflowId
{
    public class GetWorkflowTodoByWorkflowIdVm
    {
        public Guid Id { get; set; }
        public Guid WorkflowStepId { get; set; }
        public string WorkflowStepName { get; set; } = string.Empty;

        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsCompleted { get; set; } = false;
        public string Status { get; set; }
        public DateTime? DueDate { get; set; }
        public string? Notes { get; set; }
        public DateTime CreateAt { get; set; }
    }
}
