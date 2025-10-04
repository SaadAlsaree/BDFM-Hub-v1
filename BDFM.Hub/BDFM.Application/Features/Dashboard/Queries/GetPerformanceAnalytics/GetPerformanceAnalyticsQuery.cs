namespace BDFM.Application.Features.Dashboard.Queries.GetPerformanceAnalytics;

public class GetPerformanceAnalyticsQuery : IRequest<Response<PerformanceAnalyticsViewModel>>
{
    public Guid? UnitId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int TopUnitsCount { get; set; } = 10;
    public bool IncludeUserPerformance { get; set; } = false;
}
