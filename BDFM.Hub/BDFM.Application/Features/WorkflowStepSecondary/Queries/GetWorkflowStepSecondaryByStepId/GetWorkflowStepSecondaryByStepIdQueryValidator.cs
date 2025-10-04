namespace BDFM.Application.Features.WorkflowStepSecondary.Queries.GetWorkflowStepSecondaryByStepId;

public class GetWorkflowStepSecondaryByStepIdQueryValidator : AbstractValidator<GetWorkflowStepSecondaryByStepIdQuery>
{
    public GetWorkflowStepSecondaryByStepIdQueryValidator()
    {
        RuleFor(x => x.StepId)
            .NotEmpty()
            .WithMessage("StepId is required.");

        RuleFor(x => x.Page)
            .GreaterThan(0)
            .WithMessage("Page must be greater than 0.");
    }
}
