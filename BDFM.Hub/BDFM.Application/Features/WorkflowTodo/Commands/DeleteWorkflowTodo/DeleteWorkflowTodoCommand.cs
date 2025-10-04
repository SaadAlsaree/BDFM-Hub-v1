namespace BDFM.Application.Features.WorkflowTodo.Commands.DeleteWorkflowTodo
{
    public class DeleteWorkflowTodoCommand : IRequest<Response<bool>>
    {
        public Guid WorkflowStepTodoId { get; set; }
    }
}
