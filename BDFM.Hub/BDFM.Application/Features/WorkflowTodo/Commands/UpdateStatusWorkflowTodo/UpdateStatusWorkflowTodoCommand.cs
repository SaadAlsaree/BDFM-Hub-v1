namespace BDFM.Application.Features.WorkflowTodo.Commands.UpdateStatusWorkflowTodo
{
    public class UpdateStatusWorkflowTodoCommand : IRequest<Response<bool>>
    {
        public Guid WorkflowStepTodoId { get; set; }
        public bool IsCompleted { get; set; }
    }
}
