using BDFM.Application.Contracts.Identity;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.CustomWorkflowSteps.Commands.SoftDeleteCustomWorkflowStep;

internal class SoftDeleteCustomWorkflowStepHandler : IRequestHandler<SoftDeleteCustomWorkflowStepCommand, Response<bool>>
{
    private readonly IBaseRepository<CustomWorkflowStep> _customWorkflowStepRepository;
    private readonly ICurrentUserService _currentUserService;

    public SoftDeleteCustomWorkflowStepHandler(IBaseRepository<CustomWorkflowStep> customWorkflowStepRepository, ICurrentUserService currentUserService)
    {
        _customWorkflowStepRepository = customWorkflowStepRepository;
        _currentUserService = currentUserService;
    }

    public async Task<Response<bool>> Handle(SoftDeleteCustomWorkflowStepCommand request, CancellationToken cancellationToken)
    {
        var customWorkflowStep = await _customWorkflowStepRepository.Find(x => x.Id == request.Id && !x.IsDeleted);
        if (customWorkflowStep == null)
        {
            return ErrorsMessage.NotFoundData.ToErrorMessage<bool>(false);
        }

        customWorkflowStep.IsDeleted = true;
        customWorkflowStep.DeletedAt = DateTime.UtcNow;
        customWorkflowStep.DeletedBy = _currentUserService.UserId;

        _customWorkflowStepRepository.Update(customWorkflowStep);

        return SuccessMessage.Delete.ToSuccessMessage(true);
    }
}
