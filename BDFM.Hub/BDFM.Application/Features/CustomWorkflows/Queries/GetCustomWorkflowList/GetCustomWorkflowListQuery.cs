using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

namespace BDFM.Application.Features.CustomWorkflows.Queries.GetCustomWorkflowList;

public class GetCustomWorkflowListQuery : IRequest<Response<PagedResult<GetCustomWorkflowListVm>>>, IPaginationQuery
{
    public int Page { get; set; } = 1;
    public byte PageSize { get; set; } = 10;
    public string? SearchTerm { get; set; }
}
