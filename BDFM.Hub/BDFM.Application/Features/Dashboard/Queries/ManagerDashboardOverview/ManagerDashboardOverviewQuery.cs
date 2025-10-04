namespace BDFM.Application.Features.Dashboard.Queries.ManagerDashboardOverview
{
    public class ManagerDashboardOverviewQuery : IRequest<ManagerDashboardOverviewVm>
    {
        public Guid? OrganizationalUnitId { get; set; }

        public DateOnly StartDate { get; }
        public DateOnly EndDate { get; }
    }

}
