using BDFM.Application.Contracts.Identity;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.CustomWorkflowSteps.Commands.DeteleCustomWorkflowStep;

internal class DeteleCustomWorkflowStepHandler : IRequestHandler<DeteleCustomWorkflowStepCommand, Response<bool>>
{
    private readonly IBaseRepository<CustomWorkflowStep> _customWorkflowStepRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<DeteleCustomWorkflowStepHandler> _logger;

    public DeteleCustomWorkflowStepHandler(
        IBaseRepository<CustomWorkflowStep> customWorkflowStepRepository,
        ICurrentUserService currentUserService,
        ILogger<DeteleCustomWorkflowStepHandler> logger)
    {
        _customWorkflowStepRepository = customWorkflowStepRepository;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Response<bool>> Handle(DeteleCustomWorkflowStepCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Find the custom workflow step
            var customWorkflowStep = await _customWorkflowStepRepository.Find(x => x.Id == request.Id);
            if (customWorkflowStep == null)
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage<bool>(false);
            }

            // Permanently delete the custom workflow step
            await _customWorkflowStepRepository.Delete(customWorkflowStep, cancellationToken);

            _logger.LogInformation("CustomWorkflowStep {CustomWorkflowStepId} permanently deleted by user {UserId}",
                customWorkflowStep.Id, _currentUserService.UserId);

            return SuccessMessage.Delete.ToSuccessMessage(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error permanently deleting CustomWorkflowStep {CustomWorkflowStepId}", request.Id);
            return Response<bool>.Fail(
                new List<object> { "An error occurred while permanently deleting the custom workflow step" },
                new MessageResponse { Code = "Error", Message = ex.Message });
        }
    }
}


