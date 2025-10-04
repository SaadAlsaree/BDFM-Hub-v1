namespace BDFM.Application.Features.WorkflowStepSecondary.Commands.CreateWorkflowStepSecondary
{
    public class CreateWorkflowStepSecondaryCommand : IRequest<Response<bool>>
    {
        public Guid StepId { get; set; }
        public RecipientTypeEnum RecipientType { get; set; } // User or Unit

        public Guid RecipientId { get; set; } // UserID or UnitID
                                              // Similar to WorkflowStep, logic is needed to interpret RecipientId
        public string? Purpose { get; set; } // Text type in DB (???????? ????????)
        public string? InstructionText { get; set; } // Text type in DB (???? ????)
    }
}
