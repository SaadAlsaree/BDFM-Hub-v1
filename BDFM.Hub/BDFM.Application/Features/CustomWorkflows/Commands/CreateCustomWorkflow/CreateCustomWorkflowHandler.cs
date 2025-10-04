using BDFM.Application.Contracts.Identity;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.CustomWorkflows.Commands.CreateCustomWorkflow;

internal class CreateCustomWorkflowHandler : IRequestHandler<CreateCustomWorkflowCommand, Response<Guid>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IBaseRepository<CustomWorkflow> _customWorkflowRepository;

    public CreateCustomWorkflowHandler(IBaseRepository<CustomWorkflow> customWorkflowRepository, ICurrentUserService currentUserService)
    {
        _customWorkflowRepository = customWorkflowRepository;
        _currentUserService = currentUserService;
    }

    public async Task<Response<Guid>> Handle(CreateCustomWorkflowCommand request, CancellationToken cancellationToken)
    {
        // 0. check if workflow name already exists
        var existingWorkflow = await _customWorkflowRepository.Find(x => x.WorkflowName == request.WorkflowName && x.TriggeringUnitId == request.TriggeringUnitId);
        if (existingWorkflow != null)
        {
            return ErrorsMessage.ExistOnCreate.ToErrorMessage<Guid>(existingWorkflow.Id);
        }

        var customWorkflow = new CustomWorkflow
        {
            WorkflowName = request.WorkflowName,
            TriggeringUnitId = request.TriggeringUnitId,
            TriggeringCorrespondenceType = request.TriggeringCorrespondenceType,
            Description = request.Description,
            IsEnabled = request.IsEnabled,
            CreateAt = DateTime.UtcNow,
            CreateBy = _currentUserService.UserId
        };

        await _customWorkflowRepository.Create(customWorkflow, cancellationToken);

        return SuccessMessage.Get.ToSuccessMessage(customWorkflow.Id);
    }
}
