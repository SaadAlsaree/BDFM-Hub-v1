using BDFM.Application.Contracts.Identity;
using BDFM.Application.Services;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Workflow;

namespace BDFM.Application.Features.WorkflowStepSecondary.Commands.CreateWorkflowStepSecondary
{
    public class CreateWorkflowStepSecondaryHandler : IRequestHandler<CreateWorkflowStepSecondaryCommand, Response<bool>>
    {
        private readonly IBaseRepository<WorkflowStepSecondaryRecipient> _workflowStepSecondaryRecipientRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IBaseRepository<User> _userRepository;
        private readonly IAuditTrailService _auditTrailService;
        public CreateWorkflowStepSecondaryHandler(IBaseRepository<WorkflowStepSecondaryRecipient> workflowStepSecondaryRecipientRepository, ICurrentUserService currentUserService, IBaseRepository<User> userRepository, IAuditTrailService auditTrailService)
        {
            _workflowStepSecondaryRecipientRepository = workflowStepSecondaryRecipientRepository;
            _currentUserService = currentUserService;
            _userRepository = userRepository;
            _auditTrailService = auditTrailService;
        }
        public async Task<Response<bool>> Handle(CreateWorkflowStepSecondaryCommand request, CancellationToken cancellationToken)
        {
            // 1- Get current user
            var currentUser = await _userRepository.Find(x => x.Id == _currentUserService.UserId);
            if (currentUser == null)
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage<bool>(false);
            }

            // 2- check if workflow step secondary recipient already exists
            var workflowStepSecondaryRecipient = await _workflowStepSecondaryRecipientRepository.Find(x => x.StepId == request.StepId && x.RecipientType == request.RecipientType && x.RecipientId == request.RecipientId);
            if (workflowStepSecondaryRecipient != null)
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage<bool>(false);
            }

            // 3- create workflow step secondary recipient
            var newWorkflowStepSecondaryRecipient = new WorkflowStepSecondaryRecipient
            {
                StepId = request.StepId,
                RecipientType = request.RecipientType,
                RecipientId = request.RecipientId,
                Purpose = request.Purpose,
                InstructionText = request.InstructionText,
                CreateAt = DateTime.UtcNow,
                CreateBy = currentUser.Id,
            };

            // 4- save workflow step secondary recipient
            var result = await _workflowStepSecondaryRecipientRepository.Create(newWorkflowStepSecondaryRecipient);

            // Log audit trail
            //await _auditTrailService.CreateCorrespondenceAuditLogAsync(
            //          "إنشاء مستلم ثانوي",
            //          request.StepId,
            //          currentUser.Id,

            //          $" إنشاء مستلم ثانوي للكتاب {result.WorkflowStep.Correspondence.MailNum}"
            //      );

            return Response<bool>.Success(true);
        }
    }
}
