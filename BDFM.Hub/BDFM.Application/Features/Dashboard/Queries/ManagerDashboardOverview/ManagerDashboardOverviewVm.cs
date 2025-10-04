namespace BDFM.Application.Features.Dashboard.Queries.ManagerDashboardOverview
{
    public class ManagerDashboardOverviewVm
    {
        public int UrgentCorrespondenceCount { get; set; }
        public int LateCorrespondenceCount { get; set; }
        public int PostponedCorrespondenceCount { get; set; }
        public int UnreadIncomingMailCount { get; set; }
        public int TotalActiveCorrespondence { get; set; }
        public int TotalCorrespondence { get; set; }
        public double AverageMonthlyVolume { get; set; }

        public Guid? FilteredByUnitId { get; set; }
        public string? FilteredByUnitName { get; set; }

        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

    }
}
