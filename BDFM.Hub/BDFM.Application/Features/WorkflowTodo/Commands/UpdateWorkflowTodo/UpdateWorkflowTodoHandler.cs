
using BDFM.Application.Contracts.Identity;
using BDFM.Domain.Entities.Workflow;

namespace BDFM.Application.Features.WorkflowTodo.Commands.UpdateWorkflowTodo
{
    internal class UpdateWorkflowTodoHandler : IRequestHandler<UpdateWorkflowTodoCommand, Response<bool>>
    {
        private readonly IBaseRepository<WorkflowStepTodo> _workflowStepToDoRepository;
        private readonly ICurrentUserService _currentUserService;

        public UpdateWorkflowTodoHandler(IBaseRepository<WorkflowStepTodo> workflowStepToDoRepository, ICurrentUserService currentUserService)
        {
            _workflowStepToDoRepository = workflowStepToDoRepository;
            _currentUserService = currentUserService;
        }

        public async Task<Response<bool>> Handle(UpdateWorkflowTodoCommand request, CancellationToken cancellationToken)
        {
            // check if workflow step todo exists
            var workflowStepTodo = await _workflowStepToDoRepository.Find(x => x.Id == request.WorkflowStepTodoId);
            if (workflowStepTodo == null)
            {
                return ErrorsMessage.ExistOnCreate.ToErrorMessage<bool>(false);
            }

            // update workflow step todo
            workflowStepTodo.Title = request.Title;
            workflowStepTodo.Description = request.Description;
            workflowStepTodo.IsCompleted = request.IsCompleted;
            workflowStepTodo.DueDate = request.DueDate;
            workflowStepTodo.Notes = request.Notes;
            workflowStepTodo.LastUpdateAt = DateTime.UtcNow;
            workflowStepTodo.LastUpdateBy = _currentUserService.UserId;
            _workflowStepToDoRepository.Update(workflowStepTodo);

            return Response<bool>.Success(true, new MessageResponse { Code = "Succeeded", Message = "Workflow step todo updated successfully" });
        }
    }
}
