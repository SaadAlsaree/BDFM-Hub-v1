namespace BDFM.Application.Features.Dashboard.Queries.GetBacklogDetails;

public class GetBacklogDetailsQuery : IRequest<Response<BacklogDetailsViewModel>>
{
    public Guid? UnitId { get; set; }
    public int? DaysOverdue { get; set; }
    public WorkflowStepStatus? Status { get; set; }
    public bool IncludeTaskDetails { get; set; } = true;
}
