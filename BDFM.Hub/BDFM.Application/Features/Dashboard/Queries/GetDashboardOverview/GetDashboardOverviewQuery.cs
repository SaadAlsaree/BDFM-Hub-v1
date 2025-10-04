namespace BDFM.Application.Features.Dashboard.Queries.GetDashboardOverview;

public class GetDashboardOverviewQuery : IRequest<Response<DashboardOverviewViewModel>>
{
    public Guid? UnitId { get; set; } // Filter by specific unit, null for all units
    public DateTime? StartDate { get; set; } // Filter by date range
    public DateTime? EndDate { get; set; } // Filter by date range
    public int MonthsBack { get; set; } = 12; // For monthly volume calculation
}
