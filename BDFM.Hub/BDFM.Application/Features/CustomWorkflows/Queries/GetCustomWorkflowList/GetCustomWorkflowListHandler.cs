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
            TriggeringUnitName = e.TriggeringUnit!.UnitName,
            TriggeringCorrespondenceType = e.TriggeringCorrespondenceType,
            TriggeringCorrespondenceTypeName = e.TriggeringCorrespondenceType.HasValue ? e.TriggeringCorrespondenceType.Value.GetDisplayName() : string.Empty,
            Description = e.Description,
            IsEnabled = e.IsEnabled,
            CreateAt = e.CreateAt,
            LastUpdateAt = e.LastUpdateAt,
            CreateBy = e.CreateBy.ToString(),
            Status = (int)e.StatusId,
            StatusName = ((Status)e.StatusId).GetDisplayName(),
            LastUpdateBy = e.LastUpdateBy.ToString(),
            Steps = e.Steps.Select(s => new CustomWorkflowStepDto
            {
                Id = s.Id,
                WorkflowId = s.WorkflowId,
                StepOrder = s.StepOrder,
                ActionType = s.ActionType,
                ActionTypeName = s.ActionType.GetDisplayName(),
                TargetType = s.TargetType,
                TargetTypeName = s.TargetType.GetDisplayName(),
                TargetIdentifier = s.TargetIdentifier,
                // cannot reliably navigate related User/Unit inside projection here, will resolve after projection
                TargetIdentifierName = string.Empty,
                DefaultInstructionText = s.DefaultInstructionText,
                DefaultDueDateOffsetDays = s.DefaultDueDateOffsetDays
            }).ToList()
        };

    public override Func<IQueryable<CustomWorkflow>, IOrderedQueryable<CustomWorkflow>> OrderBy =>
        query => query.OrderByDescending(x => x.CreateAt);

    public async Task<Response<PagedResult<GetCustomWorkflowListVm>>> Handle(GetCustomWorkflowListQuery request, CancellationToken cancellationToken)
    {

        var query = _repository.Query();
        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(u =>
                u.WorkflowName.ToLower().Contains(searchTerm) ||
                (u.Description != null && u.Description.ToLower().Contains(searchTerm))
            );
        }

        // Apply pagination and get results
        var result = await query
            .OrderBy(x => x.CreateAt)
            .ApplyPagination(request)
            .Select(Selector)
            .ToListAsync(cancellationToken: cancellationToken);

        var count = await query
            .CountAsync(cancellationToken: cancellationToken);

        if (!result.Any())
            return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<GetCustomWorkflowListVm>>(null!);

        var pagedResult = new PagedResult<GetCustomWorkflowListVm>
        {
            Items = result,
            TotalCount = count
        };
        return SuccessMessage.Get.ToSuccessMessage(pagedResult);
    }
}
