using BDFM.Application.Contracts.Identity;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Workflow;

namespace BDFM.Application.Features.WorkflowStepSecondary.Commands.UpdateWorkflowStepSecondary
{
    public class UpdateWorkflowStepSecondaryHandler : IRequestHandler<UpdateWorkflowStepSecondaryCommand, Response<bool>>
    {
        private readonly IBaseRepository<WorkflowStepSecondaryRecipient> _workflowStepSecondaryRecipientRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IBaseRepository<User> _userRepository;

        public UpdateWorkflowStepSecondaryHandler(IBaseRepository<WorkflowStepSecondaryRecipient> workflowStepSecondaryRecipientRepository, ICurrentUserService currentUserService, IBaseRepository<User> userRepository)
        {
            _workflowStepSecondaryRecipientRepository = workflowStepSecondaryRecipientRepository;
            _currentUserService = currentUserService;
            _userRepository = userRepository;
        }

        public async Task<Response<bool>> Handle(UpdateWorkflowStepSecondaryCommand request, CancellationToken cancellationToken)
        {
            // 1- Get current user
            var currentUser = await _userRepository.Find(x => x.Id == _currentUserService.UserId);
            if (currentUser == null)
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage<bool>(false);
            }

            // 2- Find the workflow step secondary recipient to update
            var workflowStepSecondaryRecipient = await _workflowStepSecondaryRecipientRepository.Find(x => x.Id == request.Id);
            if (workflowStepSecondaryRecipient == null)
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage<bool>(false);
            }

            // 3- Check if another record with the same StepId, RecipientType, and RecipientId already exists (excluding current record)
            var existingRecord = await _workflowStepSecondaryRecipientRepository.Find(x => x.StepId == request.StepId && x.RecipientType == request.RecipientType && x.RecipientId == request.RecipientId && x.Id != request.Id);
            if (existingRecord != null)
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage<bool>(false);
            }

            // 4- Update workflow step secondary recipient properties
            workflowStepSecondaryRecipient.StepId = request.StepId;
            workflowStepSecondaryRecipient.RecipientType = request.RecipientType;
            workflowStepSecondaryRecipient.RecipientId = request.RecipientId;
            workflowStepSecondaryRecipient.Purpose = request.Purpose;
            workflowStepSecondaryRecipient.InstructionText = request.InstructionText;
            workflowStepSecondaryRecipient.LastUpdateAt = DateTime.UtcNow;
            workflowStepSecondaryRecipient.LastUpdateBy = currentUser.Id;

            // 5- Save changes
            var result = _workflowStepSecondaryRecipientRepository.Update(workflowStepSecondaryRecipient);

            return Response<bool>.Success(result);
        }
    }
}
