using BDFM.Application.Contracts.Identity;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.CustomWorkflowSteps.Commands.CreateCustomWorkflowStep;

internal class CreateCustomWorkflowStepHandler : IRequestHandler<CreateCustomWorkflowStepCommand, Response<Guid>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IBaseRepository<CustomWorkflowStep> _customWorkflowStepRepository;

    public CreateCustomWorkflowStepHandler(IBaseRepository<CustomWorkflowStep> customWorkflowStepRepository, ICurrentUserService currentUserService)
    {
        _customWorkflowStepRepository = customWorkflowStepRepository;
        _currentUserService = currentUserService;
    }

    public async Task<Response<Guid>> Handle(CreateCustomWorkflowStepCommand request, CancellationToken cancellationToken)
    {
        // 0. check if step order already exists for this workflow
        var existingStep = await _customWorkflowStepRepository.Find(x => x.WorkflowId == request.WorkflowId && x.StepOrder == request.StepOrder);
        if (existingStep != null)
        {
            return ErrorsMessage.ExistOnCreate.ToErrorMessage<Guid>(existingStep.Id);
        }

        var customWorkflowStep = new CustomWorkflowStep
        {
            WorkflowId = request.WorkflowId,
            StepOrder = request.StepOrder,
            ActionType = request.ActionType,
            TargetType = request.TargetType,
            TargetIdentifier = request.TargetIdentifier,
            DefaultInstructionText = request.DefaultInstructionText,
            DefaultDueDateOffsetDays = request.DefaultDueDateOffsetDays,
            CreateAt = DateTime.UtcNow,
            CreateBy = _currentUserService.UserId
        };

        await _customWorkflowStepRepository.Create(customWorkflowStep, cancellationToken);

        return SuccessMessage.Get.ToSuccessMessage(customWorkflowStep.Id);
    }
}
