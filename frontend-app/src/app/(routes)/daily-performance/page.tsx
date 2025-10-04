import { Suspense } from 'react';
import {
  DailyPerformanceSummary,
  DailyPerformanceSummarySkeleton,
  dashboardService
} from '@/features/dashboard';
import PageContainer from '@/components/layout/page-container';

interface DailyPerformancePageProps {
  searchParams: Promise<{
    unitId?: string;
    date?: string;
  }>;
}

async function DailyPerformancePage({
  searchParams
}: DailyPerformancePageProps) {
  const { unitId, date } = await searchParams;

  // Fetch daily performance data server-side
  let dailyPerformanceData = null;
  try {
    const response = await dashboardService.getDailyPerformanceSummary({
      unitId,
      date
    });

    if (response?.succeeded) {
      dailyPerformanceData = response.data;
    }
  } catch (error) {
    console.error('Error fetching daily performance data:', error);
  }

  return (
    <PageContainer scrollable={true}>
      <div className='container mx-auto py-6'>
        <Suspense fallback={<DailyPerformanceSummarySkeleton />}>
          <DailyPerformanceSummary
            initialData={dailyPerformanceData || undefined}
            unitId={unitId}
            date={date}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
}

export default DailyPerformancePage;
