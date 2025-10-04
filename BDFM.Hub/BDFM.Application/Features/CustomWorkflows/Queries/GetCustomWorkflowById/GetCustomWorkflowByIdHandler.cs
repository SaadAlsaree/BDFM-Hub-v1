using BDFM.Application.Features.Utility.BaseUtility.Query.GetById;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.CustomWorkflows.Queries.GetCustomWorkflowById;

internal class GetCustomWorkflowByIdHandler : GetByIdHandler<CustomWorkflow, GetCustomWorkflowByIdVm, GetCustomWorkflowByIdQuery>,
                        IRequestHandler<GetCustomWorkflowByIdQuery, Response<GetCustomWorkflowByIdVm>>
{
    public GetCustomWorkflowByIdHandler(IBaseRepository<CustomWorkflow> repository) : base(repository)
    {
    }

    public override Expression<Func<CustomWorkflow, bool>> IdPredicate(GetCustomWorkflowByIdQuery request) =>
        x => x.Id == request.Id && !x.IsDeleted;

    public override Expression<Func<CustomWorkflow, GetCustomWorkflowByIdVm>> Selector =>
        e => new GetCustomWorkflowByIdVm
        {
            Id = e.Id,
            WorkflowName = e.WorkflowName,
            TriggeringUnitId = e.TriggeringUnitId,
            TriggeringCorrespondenceType = e.TriggeringCorrespondenceType,
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
                TargetType = s.TargetType,
                TargetIdentifier = s.TargetIdentifier,
                DefaultInstructionText = s.DefaultInstructionText,
                DefaultDueDateOffsetDays = s.DefaultDueDateOffsetDays
            }).ToList()
        };

    public async Task<Response<GetCustomWorkflowByIdVm>> Handle(GetCustomWorkflowByIdQuery request, CancellationToken cancellationToken)
    {
        return await HandleBase(request, cancellationToken);
    }


}
