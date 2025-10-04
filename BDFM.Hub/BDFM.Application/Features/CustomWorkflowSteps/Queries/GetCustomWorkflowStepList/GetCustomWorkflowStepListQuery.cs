using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

namespace BDFM.Application.Features.CustomWorkflowSteps.Queries.GetCustomWorkflowStepList;

public class GetCustomWorkflowStepListQuery : IRequest<Response<PagedResult<GetCustomWorkflowStepListVm>>>, IPaginationQuery
{
    public string? SearchTerm { get; set; }
    public Guid? WorkflowId { get; set; } // Filter by specific workflow
    public int Page { get; set; } = 1;
    public byte PageSize { get; set; } = 10;
}
