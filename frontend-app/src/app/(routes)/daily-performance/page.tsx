import { Suspense } from 'react';
import {
  DailyPerformanceSummary,
  DailyPerformanceSummarySkeleton,
  dashboardService
} from '@/features/dashboard';
import PageContainer from '@/components/layout/page-container';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';

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

  const userData = await currentUserService.getCurrentUser();
  const user = userData?.data as UserDto;

  const hasRole = hasAnyRole(user, ['Correspondence']);

  const hasPermission = hasAnyPermission(user, ['Correspondence|GetUserInbox']);

  if (!hasRole && !hasPermission) {
    return <Unauthorized />;
  }

  if (user.isDefaultPassword === true) {
    return (
      <PageContainer scrollable={false}>
        <DefaultPasswordWarning />
      </PageContainer>
    );
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
