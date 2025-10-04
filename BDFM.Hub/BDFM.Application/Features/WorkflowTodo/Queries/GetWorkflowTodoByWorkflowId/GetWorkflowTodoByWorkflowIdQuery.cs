using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

namespace BDFM.Application.Features.WorkflowTodo.Queries.GetWorkflowTodoByWorkflowId
{
    public class GetWorkflowTodoByWorkflowIdQuery : IRequest<Response<PagedResult<GetWorkflowTodoByWorkflowIdVm>>>, IPaginationQuery
    {
        public Guid WorkflowId { get; set; }
        public string? SearchText { get; set; }
        public int Page { get; set; } = 1;
        public byte PageSize { get; set; } = 10;
    }
}
