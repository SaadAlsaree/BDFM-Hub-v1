using BDFM.Application.Contracts.Identity;
using BDFM.Application.Services;
using BDFM.Domain.Entities.Workflow;

namespace BDFM.Application.Features.Workflow.Commands.CompleteWorkflowStep
{
    public class CompleteWorkflowStepHandler : IRequestHandler<CompleteWorkflowStepCommand, Response<bool>>
    {
        private readonly IBaseRepository<WorkflowStep> _workflowStepRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IAuditTrailService _auditTrailService;

        public CompleteWorkflowStepHandler(IBaseRepository<WorkflowStep> workflowStepRepository, ICurrentUserService currentUserService, IAuditTrailService auditTrailService)
        {
            _workflowStepRepository = workflowStepRepository;
            _currentUserService = currentUserService;
            _auditTrailService = auditTrailService;
        }


        public async Task<Response<bool>> Handle(CompleteWorkflowStepCommand request, CancellationToken cancellationToken)
        {
            var workflowStep = await _workflowStepRepository.Find(x => x.Id == request.WorkflowStepId);
            if (workflowStep == null)
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage(false);
            }

            workflowStep.Status = WorkflowStepStatus.Completed;
            workflowStep.LastUpdateAt = DateTime.UtcNow;
            workflowStep.LastUpdateBy = _currentUserService.UserId;
            _workflowStepRepository.Update(workflowStep);

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
