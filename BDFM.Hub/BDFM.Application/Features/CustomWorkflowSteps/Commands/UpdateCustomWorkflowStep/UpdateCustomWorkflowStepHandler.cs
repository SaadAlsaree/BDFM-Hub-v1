using BDFM.Application.Features.Utility.BaseUtility.Command.Update;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.CustomWorkflowSteps.Commands.UpdateCustomWorkflowStep;

internal class UpdateCustomWorkflowStepHandler : UpdateHandler<CustomWorkflowStep, UpdateCustomWorkflowStepCommand>,
                        IRequestHandler<UpdateCustomWorkflowStepCommand, Response<bool>>
{
    public UpdateCustomWorkflowStepHandler(IBaseRepository<CustomWorkflowStep> repository) : base(repository)
    {
    }

    public override Expression<Func<CustomWorkflowStep, bool>> EntityPredicate(UpdateCustomWorkflowStepCommand request) =>
        x => x.Id == request.Id && !x.IsDeleted;

    public async Task<Response<bool>> Handle(UpdateCustomWorkflowStepCommand request, CancellationToken cancellationToken)
    {
        // Check if step order already exists for this workflow (excluding current step)
        var existingStep = await _repository.Find(x => x.WorkflowId == request.WorkflowId && x.StepOrder == request.StepOrder && x.Id != request.Id);
        if (existingStep != null)
        {
            return ErrorsMessage.ExistOnCreate.ToErrorMessage<bool>(false);
        }

        return await HandleBase(request, cancellationToken);
    }
}
