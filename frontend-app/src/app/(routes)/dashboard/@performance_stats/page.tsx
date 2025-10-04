import { TopUnitsPerformance, dashboardService } from '@/features/dashboard';

async function PerformanceStatsPage() {
  // Fetch top units performance from the API
  const response = await dashboardService.getTopUnits();
  const topUnits = response?.succeeded ? response.data : undefined;

  return (
    <TopUnitsPerformance
      data={topUnits}
      loading={false}
      error={response?.succeeded === false ? response.message : undefined}
    />
  );
}

export default PerformanceStatsPage;
