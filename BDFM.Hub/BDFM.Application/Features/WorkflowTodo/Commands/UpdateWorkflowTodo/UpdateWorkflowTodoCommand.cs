namespace BDFM.Application.Features.WorkflowTodo.Commands.UpdateWorkflowTodo
{
    public class UpdateWorkflowTodoCommand : IRequest<Response<bool>>
    {
        public Guid WorkflowStepTodoId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsCompleted { get; set; } = false;
        public DateTime? DueDate { get; set; }
        public string? Notes { get; set; }
    }
}
