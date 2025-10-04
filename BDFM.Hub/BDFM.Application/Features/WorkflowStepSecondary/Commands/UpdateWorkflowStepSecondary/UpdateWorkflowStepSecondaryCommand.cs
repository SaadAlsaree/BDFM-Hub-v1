namespace BDFM.Application.Features.WorkflowStepSecondary.Commands.UpdateWorkflowStepSecondary
{
    public class UpdateWorkflowStepSecondaryCommand : IRequest<Response<bool>>
    {
        public Guid Id { get; set; } // To identify which record to update
        public Guid StepId { get; set; }
        public RecipientTypeEnum RecipientType { get; set; } // User or Unit

        public Guid RecipientId { get; set; } // UserID or UnitID
                                              // Similar to WorkflowStep, logic is needed to interpret RecipientId
        public string? Purpose { get; set; } // Text type in DB (للاطلاع، للمتابعة)
        public string? InstructionText { get; set; } // Text type in DB (هامش مخصص)
    }
}
