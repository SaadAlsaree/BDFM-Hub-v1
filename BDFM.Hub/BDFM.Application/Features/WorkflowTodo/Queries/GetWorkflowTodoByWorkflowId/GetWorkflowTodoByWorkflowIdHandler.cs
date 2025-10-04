
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Workflow;

namespace BDFM.Application.Features.WorkflowTodo.Queries.GetWorkflowTodoByWorkflowId
{
    internal class GetWorkflowTodoByWorkflowIdHandler :
    GetAllWithCountHandler<WorkflowStepTodo, GetWorkflowTodoByWorkflowIdVm, GetWorkflowTodoByWorkflowIdQuery>,
    IRequestHandler<GetWorkflowTodoByWorkflowIdQuery, Response<PagedResult<GetWorkflowTodoByWorkflowIdVm>>>
    {
        public GetWorkflowTodoByWorkflowIdHandler(IBaseRepository<WorkflowStepTodo> repository) : base(repository)
        {
        }

        public override Expression<Func<WorkflowStepTodo, GetWorkflowTodoByWorkflowIdVm>> Selector =>
        e => new GetWorkflowTodoByWorkflowIdVm
        {
            Id = e.Id,
            WorkflowStepId = e.WorkflowStepId,
            Title = e.Title,
            Description = e.Description,
            IsCompleted = e.IsCompleted,
            Status = e.IsCompleted ? "Completed" : "Pending",
            DueDate = e.DueDate,
            Notes = e.Notes,
            CreateAt = e.CreateAt
        };

        public override Func<IQueryable<WorkflowStepTodo>, IOrderedQueryable<WorkflowStepTodo>> OrderBy =>
        query => query.OrderByDescending(x => x.CreateAt);

        public async Task<Response<PagedResult<GetWorkflowTodoByWorkflowIdVm>>> Handle(GetWorkflowTodoByWorkflowIdQuery request, CancellationToken cancellationToken)
        {
            var query = _repository.Query();
            var result = await query
                .ApplyFilter(request)
                .ApplyPagination(request)
                .Select(Selector)
                .ToListAsync(cancellationToken: cancellationToken);
            var count = await query
                .ApplyFilter(request).CountAsync(cancellationToken: cancellationToken);

            if (!result.Any())
                return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<GetWorkflowTodoByWorkflowIdVm>>(null!);

            var pagedResult = new PagedResult<GetWorkflowTodoByWorkflowIdVm>
            {
                Items = result,
                TotalCount = count
            };

            return SuccessMessage.Get.ToSuccessMessage(pagedResult);
        }
    }
}
