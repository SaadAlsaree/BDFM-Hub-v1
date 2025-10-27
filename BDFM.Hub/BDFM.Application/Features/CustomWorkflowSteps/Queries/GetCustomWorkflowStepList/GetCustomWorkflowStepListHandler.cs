using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.CustomWorkflowSteps.Queries.GetCustomWorkflowStepList;

internal class GetCustomWorkflowStepListHandler : GetAllWithCountHandler<CustomWorkflowStep, GetCustomWorkflowStepListVm, GetCustomWorkflowStepListQuery>,
                        IRequestHandler<GetCustomWorkflowStepListQuery, Response<PagedResult<GetCustomWorkflowStepListVm>>>
{
    public GetCustomWorkflowStepListHandler(IBaseRepository<CustomWorkflowStep> repository) : base(repository)
    {
    }

    public override Expression<Func<CustomWorkflowStep, GetCustomWorkflowStepListVm>> Selector =>
        e => new GetCustomWorkflowStepListVm
        {
            Id = e.Id,
            WorkflowId = e.WorkflowId,
            WorkflowName = e.CustomWorkflow.WorkflowName,
            StepOrder = e.StepOrder,
            ActionType = e.ActionType,
            TargetType = e.TargetType,
            TargetIdentifier = e.TargetIdentifier,
            DefaultInstructionText = e.DefaultInstructionText,
            DefaultDueDateOffsetDays = e.DefaultDueDateOffsetDays,
            CreateAt = e.CreateAt,
            LastUpdateAt = e.LastUpdateAt,
            Status = (int)e.StatusId,
            StatusName = e.StatusId.GetDisplayName(),
            Sequence = e.Sequence,
            IsActive = e.IsActive
        };

    public override Func<IQueryable<CustomWorkflowStep>, IOrderedQueryable<CustomWorkflowStep>> OrderBy =>
        q => q.OrderBy(x => x.WorkflowId).ThenBy(x => x.StepOrder);

    public async Task<Response<PagedResult<GetCustomWorkflowStepListVm>>> Handle(GetCustomWorkflowStepListQuery request, CancellationToken cancellationToken)
    {
        return await HandleBase(request, cancellationToken);
    }
}
