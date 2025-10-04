using BDFM.Application.Contracts.Identity;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.CustomWorkflows.Commands.UpdateCustomWorkflow;

internal class UpdateCustomWorkflowHandler : IRequestHandler<UpdateCustomWorkflowCommand, Response<bool>>
{
    private readonly IBaseRepository<CustomWorkflow> _customWorkflowRepository;
    private readonly ICurrentUserService _currentUserService;

    public UpdateCustomWorkflowHandler(IBaseRepository<CustomWorkflow> customWorkflowRepository, ICurrentUserService currentUserService)
    {
        _customWorkflowRepository = customWorkflowRepository;
        _currentUserService = currentUserService;
    }

    public async Task<Response<bool>> Handle(UpdateCustomWorkflowCommand request, CancellationToken cancellationToken)
    {
        // 0. check if workflow if not exists
        var workflow = await _customWorkflowRepository.Find(x => x.Id == request.Id && !x.IsDeleted);
        if (workflow == null)
        {
            return ErrorsMessage.NotFoundData.ToErrorMessage<bool>(false);
        }

        workflow.WorkflowName = request.WorkflowName;
        workflow.TriggeringUnitId = request.TriggeringUnitId;
        workflow.TriggeringCorrespondenceType = request.TriggeringCorrespondenceType;
        workflow.Description = request.Description;
        workflow.IsEnabled = request.IsEnabled;
        workflow.LastUpdateAt = DateTime.UtcNow;
        workflow.LastUpdateBy = _currentUserService.UserId;

        _customWorkflowRepository.Update(workflow);

        return SuccessMessage.Get.ToSuccessMessage(true);
    }
}
