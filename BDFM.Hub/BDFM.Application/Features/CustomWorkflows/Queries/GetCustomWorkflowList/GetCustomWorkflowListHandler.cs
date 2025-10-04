using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.CustomWorkflows.Queries.GetCustomWorkflowList;

internal class GetCustomWorkflowListHandler : GetAllWithCountHandler<CustomWorkflow, GetCustomWorkflowListVm, GetCustomWorkflowListQuery>,
                        IRequestHandler<GetCustomWorkflowListQuery, Response<PagedResult<GetCustomWorkflowListVm>>>

{
    public GetCustomWorkflowListHandler(IBaseRepository<CustomWorkflow> repository) : base(repository)
    {
    }

    public override Expression<Func<CustomWorkflow, GetCustomWorkflowListVm>> Selector =>
        e => new GetCustomWorkflowListVm
        {
            Id = e.Id,
            WorkflowName = e.WorkflowName,
            TriggeringUnitId = e.TriggeringUnitId,
            TriggeringCorrespondenceType = e.TriggeringCorrespondenceType,
            Description = e.Description,
            IsEnabled = e.IsEnabled,
            CreateAt = e.CreateAt,
            LastUpdateAt = e.LastUpdateAt,
            Status = (int)e.StatusId,
            StatusName = e.StatusId.GetDisplayName(),
            CreateBy = e.CreateBy.ToString()
        };

    public override Func<IQueryable<CustomWorkflow>, IOrderedQueryable<CustomWorkflow>> OrderBy =>
        query => query.OrderByDescending(x => x.CreateAt);

    public async Task<Response<PagedResult<GetCustomWorkflowListVm>>> Handle(GetCustomWorkflowListQuery request, CancellationToken cancellationToken)
    {
        return await HandleBase(request, cancellationToken);
    }
}
