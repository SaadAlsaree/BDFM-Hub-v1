using BDFM.Application.Contracts.Identity;
using BDFM.Application.Contracts.SignalR;
using BDFM.Application.Services;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Workflow;

namespace BDFM.Application.Features.Workflow.Commands.CreateBulkWorkflowSteps
{
    public class CreateBulkWorkflowStepsHandler : IRequestHandler<CreateBulkWorkflowStepsCommand, Response<bool>>
    {
        private readonly IBaseRepository<WorkflowStep> _workflowStepRepository;
        private readonly IBaseRepository<User> _userRepository;
        private readonly IBaseRepository<OrganizationalUnit> _organizationalUnitRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly ICorrespondenceNotificationService _correspondenceNotificationService;
        private readonly INotificationService _notificationService;
        private readonly ILogger<CreateBulkWorkflowStepsHandler> _logger;
        private readonly IAuditTrailService _auditTrailService;


        public CreateBulkWorkflowStepsHandler(
            IBaseRepository<WorkflowStep> workflowStepRepository,
            IBaseRepository<User> userRepository,
            IBaseRepository<OrganizationalUnit> organizationalUnitRepository,
            ICurrentUserService currentUserService,
            ICorrespondenceNotificationService correspondenceNotificationService,
            INotificationService notificationService,
            ILogger<CreateBulkWorkflowStepsHandler> logger,
            IAuditTrailService auditTrailService)
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

        public async Task<Response<bool>> Handle(CreateBulkWorkflowStepsCommand request, CancellationToken cancellationToken)
        {
            // 1- Get current user
            var currentUser = await _userRepository.Find(x => x.Id == _currentUserService.UserId);
            if (currentUser == null)
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage<bool>(false);
            }

            // 2- Validate that we have workflow steps to create
            if (request.WorkflowSteps == null || !request.WorkflowSteps.Any())
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage<bool>(false);
            }

            var createdWorkflowSteps = new List<WorkflowStep>();
            // only collect activated steps for notifications
            var activatedWorkflowSteps = new List<WorkflowStep>();
            var organizationalUnitsToNotify = new HashSet<Guid>();
            var createdStepIds = new List<Guid>();

            try
            {
                // 3- Process each workflow step
                // Assign Sequence numbers based on the order in the request (1..N)
                for (int i = 0; i < request.WorkflowSteps.Count; i++)
                {
                    var stepItem = request.WorkflowSteps[i];
                    // Check if workflow step already exists
                    var existingWorkflowStep = await _workflowStepRepository.Find(x =>
                        x.CorrespondenceId == request.CorrespondenceId &&
                        x.ToPrimaryRecipientId == stepItem.ToPrimaryRecipientId &&
                        x.ActionType == stepItem.ActionType);

                    if (existingWorkflowStep != null)
                    {
                        _logger.LogWarning("Workflow step already exists for CorrespondenceId: {CorrespondenceId}, ToPrimaryRecipientId: {ToPrimaryRecipientId}, ActionType: {ActionType}",
                            request.CorrespondenceId, stepItem.ToPrimaryRecipientId, stepItem.ActionType);
                        continue; // Skip this step and continue with others
                    }

                    // Create new workflow step
                    var newWorkflowStep = new WorkflowStep
                    {
                        CorrespondenceId = request.CorrespondenceId,
                        ToPrimaryRecipientId = stepItem.ToPrimaryRecipientId,
                        ToPrimaryRecipientType = stepItem.ToPrimaryRecipientType,
                        FromUserId = currentUser.Id,
                        FromUnitId = currentUser.OrganizationalUnitId,
                        DueDate = stepItem.DueDate.HasValue ? DateTime.SpecifyKind(stepItem.DueDate.Value, DateTimeKind.Utc) : null,
                        IsTimeSensitive = stepItem.IsTimeSensitive,
                        Status = stepItem.Status,
                        // Respect user-provided Sequence/IsActive when present
                        Sequence = stepItem.Sequence > 0 ? stepItem.Sequence : i + 1,
                        IsActive = stepItem.IsActive,
                        InstructionText = stepItem.InstructionText,
                        ActionType = stepItem.ActionType,
                        CreateAt = DateTime.UtcNow,
                        CreateBy = currentUser.Id,
                    };

                    // Save workflow step
                    var result = await _workflowStepRepository.Create(newWorkflowStep);

                    if (result != null && result.Id != Guid.Empty)
                    {
                        // If this step was marked active by the caller, ensure status is InProgress (unless already set)
                        if (result.IsActive && result.Status == Domain.Enums.WorkflowStepStatus.Pending)
                        {
                            result.Status = Domain.Enums.WorkflowStepStatus.InProgress;
                            result.ActivatedAt = DateTime.UtcNow;
                            _workflowStepRepository.Update(result);
                        }
                        createdWorkflowSteps.Add(result);
                        createdStepIds.Add(result.Id);

                        // If this step is active (we may have activated sequence==1), track it for notifications
                        if (result.IsActive)
                        {
                            activatedWorkflowSteps.Add(result);
                            if (result.ToPrimaryRecipientType == RecipientTypeEnum.Unit)
                            {
                                organizationalUnitsToNotify.Add(result.ToPrimaryRecipientId);
                            }
                        }

                        // Audit log (use safe access for MailNum)
                        var mailNum = result.Correspondence?.MailNum ?? request.CorrespondenceId.ToString();
                        await _auditTrailService.CreateCorrespondenceAuditLogAsync(
                            "إنشاء اجراء تحويل",
                            request.CorrespondenceId,
                            currentUser.Id,
                            $"تم إنشاء {createdWorkflowSteps.Count} اجراء تحويل للكتاب {mailNum}"
                        );
                    }

                }
                // If caller didn't activate any steps, activate the step with the smallest Sequence (first step)
                if (!activatedWorkflowSteps.Any() && createdWorkflowSteps.Any())
                {
                    var firstStep = createdWorkflowSteps.OrderBy(s => s.Sequence).First();
                    // Only activate if its status is Pending - otherwise respect provided status
                    if (!firstStep.IsActive && firstStep.Status == Domain.Enums.WorkflowStepStatus.Pending)
                    {
                        firstStep.IsActive = true;
                        firstStep.Status = Domain.Enums.WorkflowStepStatus.InProgress;
                        firstStep.ActivatedAt = DateTime.UtcNow;
                        _workflowStepRepository.Update(firstStep);
                        activatedWorkflowSteps.Add(firstStep);
                        if (firstStep.ToPrimaryRecipientType == RecipientTypeEnum.Unit)
                        {
                            organizationalUnitsToNotify.Add(firstStep.ToPrimaryRecipientId);
                        }
                    }
                }

                // 4- Handle bulk notifications



                // 4- Handle bulk notifications
                if (createdWorkflowSteps.Any())
                {
                    try
                    {
                        // Send notifications for organizational units
                        foreach (var unitId in organizationalUnitsToNotify)
                        {
                            var organizationalUnit = await _organizationalUnitRepository.Find(
                                ou => ou.Id == unitId,
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
                                    createdStepIds.First(), // Use first step ID for notification reference
                                    cancellationToken);

                                _logger.LogInformation("تم إنشاء خطوات العمل للكتاب {CorrespondenceId} وتم إرسال الإشعارات للوحدة {ModuleName}",
                                    request.CorrespondenceId, organizationalUnit.UnitName);
                            }
                        }


                        // Send notifications only for activated steps
                        foreach (var step in activatedWorkflowSteps)
                        {
                            // Create persistent notification for user recipients
                            if (step.ToPrimaryRecipientType == RecipientTypeEnum.User)
                            {
                                var message = $"تم تعيين اجراء على الكتاب: {step.Correspondence?.MailNum}";
                                await _notificationService.CreateNotificationAsync(
                                    step.ToPrimaryRecipientId,
                                    message,
                                    NotificationTypeEnum.NewMail,
                                    request.CorrespondenceId,
                                    step.Id,
                                    cancellationToken);
                            }

                            // Real-time notify about the created/activated workflow step
                            await _correspondenceNotificationService.NotifyWorkflowStepCreatedAsync(
                                step.Id,
                                request.CorrespondenceId,
                                step.ToPrimaryRecipientType == RecipientTypeEnum.Unit ? step.ToPrimaryRecipientId : null);
                        }

                        // Send general inbox update only if we had any activated steps
                        if (activatedWorkflowSteps.Any())
                        {
                            await _correspondenceNotificationService.NotifyInboxUpdateAsync();
                        }

                        _logger.LogInformation("تم إنشاء {Count} خطوة عمل للكتاب {CorrespondenceId}",
                            createdWorkflowSteps.Count, request.CorrespondenceId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "خطأ في إرسال الإشعارات لخطوات العمل للكتاب {CorrespondenceId}", request.CorrespondenceId);
                        // Don't fail the operation if notifications fail
                    }

                    return SuccessMessage.Get.ToSuccessMessage(true);
                }

                return ErrorsMessage.NotFoundData.ToErrorMessage<bool>(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "خطأ في إنشاء خطوات العمل للكتاب {CorrespondenceId}", request.CorrespondenceId);
                return ErrorsMessage.NotFoundData.ToErrorMessage<bool>(false);
            }
        }
    }
}
