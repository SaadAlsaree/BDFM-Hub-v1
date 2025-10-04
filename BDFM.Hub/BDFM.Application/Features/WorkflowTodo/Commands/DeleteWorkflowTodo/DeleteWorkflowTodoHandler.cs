
using BDFM.Domain.Entities.Workflow;

namespace BDFM.Application.Features.WorkflowTodo.Commands.DeleteWorkflowTodo
{
    internal class DeleteWorkflowTodoHandler : IRequestHandler<DeleteWorkflowTodoCommand, Response<bool>>
    {
        private readonly IBaseRepository<WorkflowStepTodo> _workflowStepToDoRepository;


        public DeleteWorkflowTodoHandler(IBaseRepository<WorkflowStepTodo> workflowStepToDoRepository)
        {
            _workflowStepToDoRepository = workflowStepToDoRepository;

        }

        public async Task<Response<bool>> Handle(DeleteWorkflowTodoCommand request, CancellationToken cancellationToken)
        {
            // check if workflow step todo exists
            var workflowStepTodo = await _workflowStepToDoRepository.Find(x => x.Id == request.WorkflowStepTodoId);
            if (workflowStepTodo == null)
            {
                return ErrorsMessage.ExistOnCreate.ToErrorMessage<bool>(false);
            }

            // delete workflow step todo
            await _workflowStepToDoRepository.Delete(workflowStepTodo);

            return Response<bool>.Success(true, new MessageResponse { Code = "Succeeded", Message = "Workflow step todo deleted successfully" });
        }
    }
}
