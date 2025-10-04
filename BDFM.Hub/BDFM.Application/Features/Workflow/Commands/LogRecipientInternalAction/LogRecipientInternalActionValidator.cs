namespace BDFM.Application.Features.Workflow.Commands.LogRecipientInternalAction
{
    public class LogRecipientInternalActionValidator : AbstractValidator<LogRecipientInternalActionCommand>
    {
        public LogRecipientInternalActionValidator()
        {
            RuleFor(x => x.ActionDescription).NotNull().WithMessage("ActionDescription cannot be null.");
            RuleFor(x => x.InternalActionType).NotNull().WithMessage("InternalActionType cannot be null.");
            RuleFor(x => x.WorkflowStepId).NotNull().WithMessage("WorkflowStepId cannot be null.");

        }
    }
}
