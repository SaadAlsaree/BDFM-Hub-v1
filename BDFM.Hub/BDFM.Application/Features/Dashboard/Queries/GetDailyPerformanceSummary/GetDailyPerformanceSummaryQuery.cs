namespace BDFM.Application.Features.Dashboard.Queries.GetDailyPerformanceSummary;

public class GetDailyPerformanceSummaryQuery : IRequest<Response<DailyPerformanceSummaryViewModel>>
{
    public Guid? UnitId { get; set; } // Filter by specific unit, null for all units
    public DateTime? Date { get; set; } // Specific date, defaults to today
}
