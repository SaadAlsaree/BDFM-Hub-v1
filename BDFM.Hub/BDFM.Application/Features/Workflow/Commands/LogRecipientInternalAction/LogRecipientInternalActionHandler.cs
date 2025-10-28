using BDFM.Application.Contracts.Identity;
using BDFM.Application.Contracts.SignalR;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Workflow;
using BDFM.Domain.Enums;

namespace BDFM.Application.Features.Workflow.Commands.LogRecipientInternalAction
{
    public class LogRecipientInternalActionHandler : IRequestHandler<LogRecipientInternalActionCommand, Response<bool>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IBaseRepository<User> _userRepository;
        private readonly IBaseRepository<WorkflowStep> _workflowStepRepository;
        private readonly IBaseRepository<RecipientActionLog> _recipientActionLogRepository;
        private readonly ICorrespondenceNotificationService _correspondenceNotificationService;
        private readonly INotificationService _notificationService;

        public LogRecipientInternalActionHandler(
            IBaseRepository<RecipientActionLog> recipientActionLogRepository,
            ICurrentUserService currentUserService,
            IBaseRepository<User> userRepository,
            IBaseRepository<WorkflowStep> workflowStepRepository,
            ICorrespondenceNotificationService correspondenceNotificationService,
            INotificationService notificationService)
        {
            _currentUserService = currentUserService;
            _userRepository = userRepository;
            _workflowStepRepository = workflowStepRepository;
            _recipientActionLogRepository = recipientActionLogRepository;
            _correspondenceNotificationService = correspondenceNotificationService;
            _notificationService = notificationService;
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
                // Create notifications for the recipient(s) about this internal action
                try
                {
                    // If the workflow step targets a user, notify that user
                    if (workflowStep.ToPrimaryRecipientType == Domain.Enums.RecipientTypeEnum.User)
                    {
                        // Create persistent notification in database
                        var message = $"تم تسجيل إجراء داخلي على الإجراء الخاص بالكتاب: {workflowStep.Correspondence?.MailNum}";
                        await _notificationService.CreateNotificationAsync(
                        workflowStep.ToPrimaryRecipientId,
                        message,
                        NotificationTypeEnum.NewMail,
                        workflowStep.CorrespondenceId,
                        workflowStep.Id,
                        cancellationToken: cancellationToken);

                        // ✅ Send real-time SignalR notification to the user
                        await _correspondenceNotificationService.NotifyWorkflowStepAssignedAsync(
                            workflowStep.Id,
                            workflowStep.CorrespondenceId,
                            workflowStep.ToPrimaryRecipientId,
                            currentUser.Id,
                            workflowStep.DueDate);
                    }
                    else if (workflowStep.ToPrimaryRecipientType == Domain.Enums.RecipientTypeEnum.Unit)
                    {
                        // Create module notifications for the unit
                        var message = $"تم تسجيل إجراء داخلي مرتبط بالإجراء على الكتاب: {workflowStep.Correspondence?.MailNum}";
                        await _notificationService.CreateModuleNotificationsAsync(
                            workflowStep.ToPrimaryRecipientId,
                            message,
                            NotificationTypeEnum.NewMail,
                            workflowStep.CorrespondenceId,
                            workflowStep.Id,
                            cancellationToken);

                        // ✅ Send real-time SignalR notification to the module
                        await _correspondenceNotificationService.NotifyWorkflowStepAssignedAsync(
                            workflowStep.Id,
                            workflowStep.CorrespondenceId,
                            workflowStep.ToPrimaryRecipientId,
                            currentUser.Id,
                            workflowStep.DueDate);
                    }

                    // Real-time notify UI about the workflow step update and inbox
                    await _correspondenceNotificationService.NotifyWorkflowStepCreatedAsync(workflowStep.Id, workflowStep.CorrespondenceId,
                        workflowStep.ToPrimaryRecipientType == Domain.Enums.RecipientTypeEnum.Unit ? workflowStep.ToPrimaryRecipientId : null);

                    await _correspondenceNotificationService.NotifyInboxUpdateAsync();
                }
                catch
                {
                    // swallow notification errors
                }

                return SuccessMessage.Create.ToSuccessMessage(true);
            }

            // 5- Return error if creation failed
            return ErrorsMessage.FailOnCreate.ToErrorMessage(false);
        }
    }
}
