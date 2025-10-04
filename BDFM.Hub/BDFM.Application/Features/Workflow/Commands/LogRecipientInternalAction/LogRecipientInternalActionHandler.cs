using BDFM.Application.Contracts.Identity;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Workflow;

namespace BDFM.Application.Features.Workflow.Commands.LogRecipientInternalAction
{
    public class LogRecipientInternalActionHandler : IRequestHandler<LogRecipientInternalActionCommand, Response<bool>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IBaseRepository<User> _userRepository;
        private readonly IBaseRepository<WorkflowStep> _workflowStepRepository;
        private readonly IBaseRepository<RecipientActionLog> _recipientActionLogRepository;

        public LogRecipientInternalActionHandler(
            IBaseRepository<RecipientActionLog> recipientActionLogRepository,
            ICurrentUserService currentUserService,
            IBaseRepository<User> userRepository,
            IBaseRepository<WorkflowStep> workflowStepRepository)
        {
            _currentUserService = currentUserService;
            _userRepository = userRepository;
            _workflowStepRepository = workflowStepRepository;
            _recipientActionLogRepository = recipientActionLogRepository;
        }

        public async Task<Response<bool>> Handle(LogRecipientInternalActionCommand request, CancellationToken cancellationToken)
        {
            // 1- Get current user
            var currentUser = await _userRepository.Find(x => x.Id == _currentUserService.UserId);
            if (currentUser == null)
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage(false);
            }

            // 2- Check if workflow step exists
            var workflowStep = await _workflowStepRepository.Find(x => x.Id == request.WorkflowStepId);
            if (workflowStep == null)
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage(false);
            }

            // 3- Create recipient action log
            var newRecipientActionLog = new RecipientActionLog
            {
                WorkflowStepId = request.WorkflowStepId,
                ActionTakenByUnitId = currentUser.OrganizationalUnitId,
                ActionTakenByUserId = currentUser.Id,
                ActionTimestamp = request.ActionTimestamp,
                ActionDescription = request.ActionDescription,
                Notes = request.Notes,
                InternalActionType = request.InternalActionType,
                CreateAt = DateTime.UtcNow,
                CreateBy = currentUser.Id,
            };

            // 4- Save recipient action log
            var result = await _recipientActionLogRepository.Create(newRecipientActionLog);

            if (result.Id != Guid.Empty)
            {
                return SuccessMessage.Create.ToSuccessMessage(true);
            }

            // 5- Return error if creation failed
            return ErrorsMessage.FailOnCreate.ToErrorMessage(false);
        }
    }
}
