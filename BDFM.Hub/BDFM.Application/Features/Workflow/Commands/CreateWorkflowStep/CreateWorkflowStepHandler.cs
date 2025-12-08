using BDFM.Application.Contracts.Identity;
using BDFM.Application.Contracts.SignalR;
using BDFM.Application.Services;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Workflow;

namespace BDFM.Application.Features.Workflow.Commands.CreateWorkflowStep
{
    public class CreateWorkflowStepHandler : IRequestHandler<CreateWorkflowStepCommand, Response<bool>>
    {
        private readonly IBaseRepository<WorkflowStep> _workflowStepRepository;
        private readonly IBaseRepository<User> _userRepository;
        private readonly IBaseRepository<OrganizationalUnit> _organizationalUnitRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly ICorrespondenceNotificationService _correspondenceNotificationService;
        private readonly INotificationService _notificationService;
        private readonly ILogger<CreateWorkflowStepHandler> _logger;
        private readonly IAuditTrailService _auditTrailService;

        public CreateWorkflowStepHandler(
            IBaseRepository<WorkflowStep> workflowStepRepository,
            IBaseRepository<User> userRepository,
            IBaseRepository<OrganizationalUnit> organizationalUnitRepository,
            ICurrentUserService currentUserService,
            ICorrespondenceNotificationService correspondenceNotificationService,
            INotificationService notificationService,
            IAuditTrailService auditTrailService,
            ILogger<CreateWorkflowStepHandler> logger)
        {
            _workflowStepRepository = workflowStepRepository;
            _userRepository = userRepository;
            _organizationalUnitRepository = organizationalUnitRepository;
            _currentUserService = currentUserService;
            _correspondenceNotificationService = correspondenceNotificationService;
            _notificationService = notificationService;
            _logger = logger;
            _auditTrailService = auditTrailService;
        }

        public async Task<Response<bool>> Handle(CreateWorkflowStepCommand request, CancellationToken cancellationToken)
        {
            // 1- Get current user
            var currentUser = await _userRepository.Find(x => x.Id == _currentUserService.UserId);
            if (currentUser == null)
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage<bool>(false);
            }

            // 2- check if workflow step already exists 
            var workflowStep = await _workflowStepRepository.Find(x =>
            x.CorrespondenceId == request.CorrespondenceId &&
            x.ToPrimaryRecipientId == request.ToPrimaryRecipientId &&
            x.ActionType == request.ActionType);

            if (workflowStep != null)
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage<bool>(false);
            }

            // 3- create workflow step
            var newWorkflowStep = new WorkflowStep
            {
                CorrespondenceId = request.CorrespondenceId,
                ToPrimaryRecipientId = request.ToPrimaryRecipientId,
                ToPrimaryRecipientType = request.ToPrimaryRecipientType,
                FromUserId = currentUser.Id,
                FromUnitId = currentUser.OrganizationalUnitId,
                DueDate = request.DueDate.HasValue ? DateTime.SpecifyKind(request.DueDate.Value, DateTimeKind.Utc) : null,
                IsTimeSensitive = request.IsTimeSensitive,
                Status = request.Status,
                IsActive = true,
                // Sequence will be set below (max existing + 1)
                InstructionText = request.InstructionText,
                ActionType = request.ActionType,
                CreateAt = DateTime.UtcNow,
                CreateBy = currentUser.Id,
            };

            // Determine sequence as max existing sequence for the correspondence + 1
            var existingMax = (await _workflowStepRepository.GetAsync(
                s => s.CorrespondenceId == request.CorrespondenceId,
                orderBy: q => q.OrderByDescending(s => s.Sequence),
                take: 1,
                skip: -1)).FirstOrDefault();

            if (existingMax != null)
            {
                newWorkflowStep.Sequence = existingMax.Sequence + 1;
            }
            else
            {
                newWorkflowStep.Sequence = 1;
            }

            // If this is the first step and incoming status is Pending, activate it
            if (newWorkflowStep.Sequence == 1 && newWorkflowStep.Status == Domain.Enums.WorkflowStepStatus.Pending)
            {
                newWorkflowStep.IsActive = true;
                newWorkflowStep.Status = Domain.Enums.WorkflowStepStatus.InProgress;
                newWorkflowStep.ActivatedAt = DateTime.UtcNow;
            }



            // 4- save workflow step
            var result = await _workflowStepRepository.Create(newWorkflowStep);

            // Log audit trail
            // await _auditTrailService.CreateCorrespondenceAuditLogAsync(
            //           "إنشاء اجراء تحويل",
            //           request.CorrespondenceId,
            //           currentUser.Id,
            //           $"تم إنشاء اجراء تحويل للكتاب {result.Correspondence.MailNum}"
            //       );

            if (result.Id != Guid.Empty)
            {
                try
                {
                    // 5- Handle notifications based on recipient type
                    if (request.ToPrimaryRecipientType == RecipientTypeEnum.Unit)
                    {
                        // Get organizational unit information
                        var organizationalUnit = await _organizationalUnitRepository.Find(
                            ou => ou.Id == request.ToPrimaryRecipientId,
                            cancellationToken: cancellationToken);

                        if (organizationalUnit != null)
                        {
                            // Send real-time notification for correspondence assigned to module
                            await _correspondenceNotificationService.NotifyCorrespondenceAssignedToModuleAsync(
                                request.CorrespondenceId,
                                organizationalUnit.Id,
                                organizationalUnit.UnitName);

                            // Create persistent notifications for all users in the module
                            await _notificationService.CreateModuleNotificationsAsync(
                                organizationalUnit.Id,
                                $"لقد تم تحويل الكتاب لوحدتك: {organizationalUnit.UnitName}",
                                NotificationTypeEnum.NewMail,
                                request.CorrespondenceId,
                                result.Id,
                                cancellationToken);

                            _logger.LogInformation("تم إنشاء خطوة العمل {WorkflowStepId} وتم إرسال الإشعارات للكتاب {CorrespondenceId} المعين للوحدة {ModuleName}",
                                result.Id, request.CorrespondenceId, organizationalUnit.UnitName);
                        }
                    }

                    // If the recipient is a user, create a persistent notification for that user
                    if (request.ToPrimaryRecipientType == RecipientTypeEnum.User)
                    {
                        try
                        {
                            var message = $"تم تعيين اجراء على الكتاب: {result.Correspondence?.MailNum}";

                            // Create persistent notification in database
                            await _notificationService.CreateNotificationAsync(
                                request.ToPrimaryRecipientId,
                                message,
                                NotificationTypeEnum.NewMail,
                                request.CorrespondenceId,
                                result.Id,
                                cancellationToken);

                            // ✅ Send real-time SignalR notification to the assigned user
                            await _correspondenceNotificationService.NotifyWorkflowStepAssignedAsync(
                                result.Id,
                                request.CorrespondenceId,
                                request.ToPrimaryRecipientId,
                                currentUser.Id,
                                request.DueDate);

                            _logger.LogInformation("✅ تم إنشاء خطوة العمل {WorkflowStepId} وتم إرسال إشعار فوري ومحفوظ للمستخدم {UserId}",
                                result.Id, request.ToPrimaryRecipientId);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "❌ خطأ في إرسال الإشعار للمستخدم {UserId} لخطوة العمل {WorkflowStepId}",
                                request.ToPrimaryRecipientId, result.Id);
                        }
                    }

                    // Send general workflow step created notification
                    await _correspondenceNotificationService.NotifyWorkflowStepCreatedAsync(
                        result.Id,
                        request.CorrespondenceId,
                        request.ToPrimaryRecipientType == RecipientTypeEnum.Unit ? request.ToPrimaryRecipientId : null);

                    // Send general inbox update
                    await _correspondenceNotificationService.NotifyInboxUpdateAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "خطأ في إرسال الإشعارات لخطوة العمل {WorkflowStepId}", result.Id);
                    // Don't fail the operation if notifications fail
                }

                return SuccessMessage.Get.ToSuccessMessage(true);
            }

            // 5- return success
            return ErrorsMessage.NotFoundData.ToErrorMessage<bool>(false);
        }
    }
}
