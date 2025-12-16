namespace BDFM.Application.Features.Workflow.Queries.GetWorkflowStepsStatisticsByUnit;

public class GetWorkflowStepsStatisticsByUnitQuery : IRequest<Response<WorkflowStepsStatisticsAllVm>>
{
    public Guid? UnitId { get; set; }
    public bool IncludeSubUnits { get; set; } = false;
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
}

