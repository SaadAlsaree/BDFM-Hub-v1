using BDFM.Application.Contracts.Identity;
using BDFM.Application.Contracts.SignalR;
using BDFM.Application.Services;
using BDFM.Domain.Entities.Workflow;
using BDFM.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace BDFM.Application.Features.Workflow.Commands.CompleteWorkflowStep
{
    public class CompleteWorkflowStepHandler : IRequestHandler<CompleteWorkflowStepCommand, Response<bool>>
    {
        private readonly IBaseRepository<WorkflowStep> _workflowStepRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IAuditTrailService _auditTrailService;
        private readonly ICorrespondenceNotificationService _correspondenceNotificationService;
        private readonly INotificationService _notificationService;

        public CompleteWorkflowStepHandler(
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


        public async Task<Response<bool>> Handle(CompleteWorkflowStepCommand request, CancellationToken cancellationToken)
        {
            var workflowStep = await _workflowStepRepository.Find(x => x.Id == request.WorkflowStepId);
            if (workflowStep == null)
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage(false);
            }

            // Mark current step as completed
            workflowStep.Status = WorkflowStepStatus.Completed;
            workflowStep.LastUpdateAt = DateTime.UtcNow;
            workflowStep.LastUpdateBy = _currentUserService.UserId;
            workflowStep.CompletedAt = DateTime.UtcNow;
            _workflowStepRepository.Update(workflowStep);

            try
            {
                // Find the next step for the same correspondence by Sequence
                var nextStep = await _workflowStepRepository.Find(
                    s => s.CorrespondenceId == workflowStep.CorrespondenceId && s.Sequence > workflowStep.Sequence,
                    orderBy: q => q.OrderBy(s => EF.Property<int>(s, "Sequence"))
                );

                if (nextStep != null)
                {
                    // If the next step is already active, skip activation and notifications
                    if (!nextStep.IsActive)
                    {
                        nextStep.IsActive = true;
                        if (nextStep.Status == WorkflowStepStatus.Pending)
                        {
                            nextStep.Status = WorkflowStepStatus.InProgress; // or Pending -> InProgress as business requires
                        }
                        nextStep.ActivatedAt = DateTime.UtcNow;
                        nextStep.LastUpdateAt = DateTime.UtcNow;
                        nextStep.LastUpdateBy = _currentUserService.UserId;
                        _workflowStepRepository.Update(nextStep);

                        try
                        {
                            // Notify assigned/activated step via SignalR
                            await _correspondenceNotificationService.NotifyWorkflowStepAssignedAsync(
                                nextStep.Id,
                                nextStep.CorrespondenceId,
                                nextStep.ToPrimaryRecipientId,
                                _currentUserService.UserId,
                                nextStep.DueDate);

                            // If recipient is a unit, create module notifications for that unit
                            if (nextStep.ToPrimaryRecipientType == Domain.Enums.RecipientTypeEnum.Unit)
                            {
                                await _notificationService.CreateModuleNotificationsAsync(
                                    nextStep.ToPrimaryRecipientId,
                                    $"لقد تم تحويل الكتاب لوحدتك: {nextStep.Correspondence?.MailNum}",
                                    NotificationTypeEnum.NewMail,
                                    nextStep.CorrespondenceId,
                                    nextStep.Id,
                                    cancellationToken);
                            }
                            else if (nextStep.ToPrimaryRecipientType == Domain.Enums.RecipientTypeEnum.User)
                            {
                                // Create a persistent notification for the assigned user
                                var message = $"تم تعيين اجراء على الكتاب: {nextStep.Correspondence?.MailNum}";
                                await _notificationService.CreateNotificationAsync(
                                    nextStep.ToPrimaryRecipientId,
                                    message,
                                    NotificationTypeEnum.NewMail,
                                    nextStep.CorrespondenceId,
                                    nextStep.Id,
                                    cancellationToken);
                            }

                            // Real-time notify creation of the workflow step and inbox update
                            await _correspondenceNotificationService.NotifyWorkflowStepCreatedAsync(nextStep.Id, nextStep.CorrespondenceId,
                                nextStep.ToPrimaryRecipientType == Domain.Enums.RecipientTypeEnum.Unit ? nextStep.ToPrimaryRecipientId : null);

                            await _correspondenceNotificationService.NotifyInboxUpdateAsync();
                        }
                        catch
                        {
                            // Swallow notification errors to avoid failing the completion flow
                        }
                    }
                }
            }
            catch
            {
                // Swallow the exception to avoid failing the completion flow.
                // If you want to log errors add ILogger<CompleteWorkflowStepHandler> and log here.
            }

            // await _auditTrailService.CreateCorrespondenceAuditLogAsync(
            //    "تعديل حالة",
            //    workflowStep.CorrespondenceId,
            //    _currentUserService.UserId,
            //    $"تعديل حالة الاجراء الخاص بالكتاب {workflowStep.Correspondence.MailNum}"

            // );

            return Response<bool>.Success(true, new MessageResponse { Code = "Succeeded", Message = "" });
        }
    }
}
