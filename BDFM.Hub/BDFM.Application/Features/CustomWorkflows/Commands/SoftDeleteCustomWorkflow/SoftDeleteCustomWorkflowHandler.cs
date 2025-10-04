using BDFM.Application.Contracts.Identity;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.CustomWorkflows.Commands.SoftDeleteCustomWorkflow;

internal class SoftDeleteCustomWorkflowHandler : IRequestHandler<SoftDeleteCustomWorkflowCommand, Response<bool>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IBaseRepository<CustomWorkflow> _customWorkflowRepository;

    public SoftDeleteCustomWorkflowHandler(IBaseRepository<CustomWorkflow> customWorkflowRepository, ICurrentUserService currentUserService)
    {
        _customWorkflowRepository = customWorkflowRepository;
        _currentUserService = currentUserService;
    }

    public async Task<Response<bool>> Handle(SoftDeleteCustomWorkflowCommand request, CancellationToken cancellationToken)
    {
        // 0. check if workflow is already deleted
        var workflow = await _customWorkflowRepository.Find(x => x.Id == request.Id && x.IsDeleted);
        if (workflow == null)
        {
            return ErrorsMessage.NotFoundData.ToErrorMessage<bool>(false);
        }

        workflow.IsDeleted = true;
        workflow.LastUpdateAt = DateTime.UtcNow;
        workflow.LastUpdateBy = _currentUserService.UserId;

        _customWorkflowRepository.Update(workflow);

        return SuccessMessage.Get.ToSuccessMessage(true);
    }
}
