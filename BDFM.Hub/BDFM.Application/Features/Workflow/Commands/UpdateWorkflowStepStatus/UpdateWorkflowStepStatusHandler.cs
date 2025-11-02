
using BDFM.Application.Contracts.Identity;
using BDFM.Application.Contracts.SignalR;
using BDFM.Application.Services;
using BDFM.Domain.Entities.Workflow;

namespace BDFM.Application.Features.Workflow.Commands.UpdateWorkflowStepStatus
{
    public class UpdateWorkflowStepStatusHandler : IRequestHandler<UpdateWorkflowStepStatusCommand, Response<bool>>
    {
        private readonly IBaseRepository<WorkflowStep> _workflowStepRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IAuditTrailService _auditTrailService;
        private readonly ICorrespondenceNotificationService _correspondenceNotificationService;
        private readonly INotificationService _notificationService;
        public UpdateWorkflowStepStatusHandler(
            IBaseRepository<WorkflowStep> workflowStepRepository,
            ICurrentUserService currentUserService,
            IAuditTrailService auditTrailService,
            ICorrespondenceNotificationService correspondenceNotificationService,
            INotificationService notificationService)
        {
            _workflowStepRepository = workflowStepRepository;
            _currentUserService = currentUserService;
            _auditTrailService = auditTrailService;
            _correspondenceNotificationService = correspondenceNotificationService;
            _notificationService = notificationService;
        }
        public async Task<Response<bool>> Handle(UpdateWorkflowStepStatusCommand request, CancellationToken cancellationToken)
        {
            var workflowStep = await _workflowStepRepository.Find(x => x.Id == request.WorkflowStepId);
            if (workflowStep == null)
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage(false);
            }

            // Update status and last update fields
            workflowStep.Status = request.Status;
            workflowStep.LastUpdateAt = DateTime.UtcNow;
            workflowStep.LastUpdateBy = _currentUserService.UserId;

            // If marking as completed, set completed metadata
            if (request.Status == WorkflowStepStatus.Completed)
            {
                workflowStep.CompletedAt = DateTime.UtcNow;
            }

            _workflowStepRepository.Update(workflowStep);

            // If completed, try to activate the next step in sequence
            if (request.Status == WorkflowStepStatus.Completed)
            {
                try
                {
                    var nextStep = await _workflowStepRepository.Find(
                        s => s.CorrespondenceId == workflowStep.CorrespondenceId && s.Sequence > workflowStep.Sequence,
                        orderBy: q => q.OrderBy(s => s.Sequence)
                    );

                    if (nextStep != null)
                    {
                        // Skip if next step already active
                        if (!nextStep.IsActive)
                        {
                            nextStep.IsActive = true;
                            nextStep.Status = WorkflowStepStatus.InProgress;
                            nextStep.ActivatedAt = DateTime.UtcNow;
                            nextStep.LastUpdateAt = DateTime.UtcNow;
                            nextStep.LastUpdateBy = _currentUserService.UserId;
                            _workflowStepRepository.Update(nextStep);

                            try
                            {
                                // Persistent notifications and real-time SignalR
                                if (nextStep.ToPrimaryRecipientType == RecipientTypeEnum.Unit)
                                {
                                    // Send real-time SignalR notification to the module
                                    await _correspondenceNotificationService.NotifyWorkflowStepAssignedAsync(
                                        nextStep.Id,
                                        nextStep.CorrespondenceId ?? Guid.Empty,
                                        nextStep.ToPrimaryRecipientId,
                                        _currentUserService.UserId,
                                        nextStep.DueDate);

                                    // Create persistent notifications for all users in the module
                                    await _notificationService.CreateModuleNotificationsAsync(
                                        nextStep.ToPrimaryRecipientId,
                                        $"لقد تم تحويل الكتاب لوحدتك: {nextStep.Correspondence?.MailNum}",
                                        NotificationTypeEnum.NewMail,
                                        nextStep.CorrespondenceId,
                                        nextStep.Id,
                                        cancellationToken);
                                }
                                else if (nextStep.ToPrimaryRecipientType == RecipientTypeEnum.User)
                                {
                                    // Create persistent notification in database
                                    var message = $"تم تعيين اجراء على الكتاب: {nextStep.Correspondence?.MailNum}";
                                    await _notificationService.CreateNotificationAsync(
                                        nextStep.ToPrimaryRecipientId,
                                        message,
                                        NotificationTypeEnum.NewMail,
                                        nextStep.CorrespondenceId,
                                        nextStep.Id,
                                        cancellationToken);

                                    // ✅ Send real-time SignalR notification to the assigned user
                                    await _correspondenceNotificationService.NotifyWorkflowStepAssignedAsync(
                                        nextStep.Id,
                                        nextStep.CorrespondenceId ?? Guid.Empty,
                                        nextStep.ToPrimaryRecipientId,
                                        _currentUserService.UserId,
                                        nextStep.DueDate);
                                }

                                // Notify UI and inbox
                                await _correspondenceNotificationService.NotifyWorkflowStepCreatedAsync(nextStep.Id, nextStep.CorrespondenceId ?? Guid.Empty,
                                    nextStep.ToPrimaryRecipientType == RecipientTypeEnum.Unit ? nextStep.ToPrimaryRecipientId : null);

                                await _correspondenceNotificationService.NotifyInboxUpdateAsync();
                            }
                            catch
                            {
                                // Swallow notification errors; consider logging
                            }
                        }
                    }
                }
                catch
                {
                    // Swallow errors here; consider adding ILogger to record activation failures.
                    return Response<bool>.Success(true,
                        new MessageResponse { Code = "SucceededWithWarnings", Message = "تم تعديل اجراء التحويل بنجاح، ولكن حدثت مشكلة في تفعيل الخطوة التالية." });
                }
            }


            //     await _auditTrailService.CreateCorrespondenceAuditLogAsync(
            //      "تعديل اجراء التحويل",
            //      workflowStep.CorrespondenceId,
            //      _currentUserService.UserId,
            //      $"تعديل الاجراء الخاص بالكتاب {workflowStep.Correspondence.MailNum}"
            //   );



            return Response<bool>.Success(true,
                new MessageResponse { Code = "Succeeded", Message = "تم تعديل اجراء التحويل بنجاح" });
        }
    }
}
