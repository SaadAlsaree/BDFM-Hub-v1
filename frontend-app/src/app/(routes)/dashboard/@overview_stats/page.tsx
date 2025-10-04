import {
  CorrespondenceTypeChart,
  dashboardService
} from '@/features/dashboard';

async function OverviewStatsPage() {
  // Fetch type distribution from the API
  const response = await dashboardService.getTypeDistribution();
  const typeDistribution = response?.succeeded ? response.data : undefined;

  return (
    <CorrespondenceTypeChart
      data={typeDistribution}
      loading={false}
      error={response?.succeeded === false ? response.message : undefined}
    />
  );
}

export default OverviewStatsPage;
