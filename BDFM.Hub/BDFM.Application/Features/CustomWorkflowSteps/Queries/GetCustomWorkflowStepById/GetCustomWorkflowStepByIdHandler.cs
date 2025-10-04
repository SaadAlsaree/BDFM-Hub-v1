using BDFM.Application.Features.Utility.BaseUtility.Query.GetById;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.CustomWorkflowSteps.Queries.GetCustomWorkflowStepById;

internal class GetCustomWorkflowStepByIdHandler : GetByIdHandler<CustomWorkflowStep, GetCustomWorkflowStepByIdVm, GetCustomWorkflowStepByIdQuery>,
                        IRequestHandler<GetCustomWorkflowStepByIdQuery, Response<GetCustomWorkflowStepByIdVm>>
{
    public GetCustomWorkflowStepByIdHandler(IBaseRepository<CustomWorkflowStep> repository) : base(repository)
    {
    }

    public override Expression<Func<CustomWorkflowStep, bool>> IdPredicate(GetCustomWorkflowStepByIdQuery request) =>
        x => x.Id == request.Id && !x.IsDeleted;

    public override Expression<Func<CustomWorkflowStep, GetCustomWorkflowStepByIdVm>> Selector =>
        e => new GetCustomWorkflowStepByIdVm
        {
            Id = e.Id,
            WorkflowId = e.WorkflowId,
            StepOrder = e.StepOrder,
            ActionType = e.ActionType,
            TargetType = e.TargetType,
            TargetIdentifier = e.TargetIdentifier,
            DefaultInstructionText = e.DefaultInstructionText,
            DefaultDueDateOffsetDays = e.DefaultDueDateOffsetDays,
            CreateAt = e.CreateAt,
            LastUpdateAt = e.LastUpdateAt,
            CreateBy = e.CreateBy.ToString(),
            LastUpdateBy = e.LastUpdateBy.ToString(),
            StatusId = (int)e.StatusId,
            StatusName = e.StatusId.GetDisplayName() // Will be populated by base handler
        };

    public async Task<Response<GetCustomWorkflowStepByIdVm>> Handle(GetCustomWorkflowStepByIdQuery request, CancellationToken cancellationToken)
    {
        return await HandleBase(request, cancellationToken);
    }
}
