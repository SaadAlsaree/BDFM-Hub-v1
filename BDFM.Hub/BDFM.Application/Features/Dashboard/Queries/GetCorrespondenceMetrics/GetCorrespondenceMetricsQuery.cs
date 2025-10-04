namespace BDFM.Application.Features.Dashboard.Queries.GetCorrespondenceMetrics;

public class GetCorrespondenceMetricsQuery : IRequest<Response<CorrespondenceMetricsViewModel>>
{
    public Guid? UnitId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public CorrespondenceTypeEnum? CorrespondenceType { get; set; }
    public CorrespondenceStatusEnum? Status { get; set; }
}
