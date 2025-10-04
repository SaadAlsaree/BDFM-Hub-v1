import { DashboardStatsCards, dashboardService } from '@/features/dashboard';

async function TaskStatsPage() {
  // Fetch quick stats from the API
  const response = await dashboardService.getQuickStats();
  const quickStats = response?.succeeded ? response.data : undefined;

  return (
    <DashboardStatsCards
      data={quickStats}
      loading={false}
      error={response?.succeeded === false ? response.message : undefined}
    />
  );
}

export default TaskStatsPage;
