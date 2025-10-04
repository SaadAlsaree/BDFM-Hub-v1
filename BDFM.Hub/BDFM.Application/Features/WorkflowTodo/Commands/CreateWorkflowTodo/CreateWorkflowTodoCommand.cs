namespace BDFM.Application.Features.WorkflowTodo.Commands.CreateWorkflowTodo
{
    public class CreateWorkflowTodoCommand : IRequest<Response<bool>>
    {
        public Guid WorkflowStepId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsCompleted { get; set; } = false;
        public DateTime? DueDate { get; set; }
        public string? Notes { get; set; }
    }
}
