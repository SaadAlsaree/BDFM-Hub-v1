namespace BDFM.Application.Features.Workflow.Commands.CreateWorkflowStep
{
    public class CreateWorkflowStepValidator : AbstractValidator<CreateWorkflowStepCommand>
    {
        public CreateWorkflowStepValidator()
        {
            RuleFor(x => x.CorrespondenceId).NotEmpty().WithMessage("Correspondence ID is required.");
            RuleFor(x => x.ToPrimaryRecipientId).NotEmpty().WithMessage("Primary recipient ID is required.");
            RuleFor(x => x.ToPrimaryRecipientType).NotEmpty().WithMessage("Primary recipient type is required.");
            RuleFor(x => x.DueDate).NotEmpty().WithMessage("Due date is required.");
            //RuleFor(x => x.IsTimeSensitive).NotEmpty().WithMessage("Is time sensitive is required.");
            RuleFor(x => x.InstructionText).NotEmpty().WithMessage("Instruction text is required.");
        }
    }

}
