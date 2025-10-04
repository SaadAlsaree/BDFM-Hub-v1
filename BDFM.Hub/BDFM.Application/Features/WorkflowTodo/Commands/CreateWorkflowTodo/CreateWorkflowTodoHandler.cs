
using BDFM.Application.Contracts.Identity;
using BDFM.Domain.Entities.Workflow;

namespace BDFM.Application.Features.WorkflowTodo.Commands.CreateWorkflowTodo
{
    internal class CreateWorkflowTodoHandler : IRequestHandler<CreateWorkflowTodoCommand, Response<bool>>
    {
        private readonly IBaseRepository<WorkflowStepTodo> _workflowStepToDoRepository;
        private readonly ICurrentUserService _currentUserService;

        public CreateWorkflowTodoHandler(IBaseRepository<WorkflowStepTodo> workflowStepToDoRepository, ICurrentUserService currentUserService)
        {
            _workflowStepToDoRepository = workflowStepToDoRepository;
            _currentUserService = currentUserService;
        }

        public async Task<Response<bool>> Handle(CreateWorkflowTodoCommand request, CancellationToken cancellationToken)
        {
            // check if workflow step exists
            var workflowStepTodo = await _workflowStepToDoRepository.Find(x => x.WorkflowStepId == request.WorkflowStepId && x.Title == request.Title);
            if (workflowStepTodo != null)
            {
                return ErrorsMessage.ExistOnCreate.ToErrorMessage<bool>(false);
            }

            // create workflow step todo
            var newWorkflowStepTodo = new WorkflowStepTodo
            {
                WorkflowStepId = request.WorkflowStepId,
                Title = request.Title,
                Description = request.Description,
                IsCompleted = request.IsCompleted,
                DueDate = request.DueDate,
                Notes = request.Notes,
                CreateBy = _currentUserService.UserId,
                CreateAt = DateTime.UtcNow,

            };

            await _workflowStepToDoRepository.Create(newWorkflowStepTodo);

            return Response<bool>.Success(true, new MessageResponse { Code = "Succeeded", Message = "Workflow step todo created successfully" });
        }
    }
}
