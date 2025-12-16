import { Suspense } from 'react';
import { SearchParams } from 'nuqs/server';
import PageContainer from '@/components/layout/page-container';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { WorkflowStepsStatistics } from '@/features/workflow-steps-statistics/components/workflow-steps-statistics';
import { workflowStepsStatisticsService } from '@/features/workflow-steps-statistics/api/workflow-steps-statistics.service';
import {
  WorkflowStepsStatisticsQuery,
  WorkflowStepsStatisticsResponse
} from '@/features/workflow-steps-statistics/types/workflow-steps-statistics';
import { searchParamsCache } from '@/lib/searchparams';

// Force dynamic rendering since we use getServerSession which requires headers
export const dynamic = 'force-dynamic';

interface WorkflowStatisticsPageProps {
  searchParams: Promise<SearchParams>;
}

const page = async (props: WorkflowStatisticsPageProps) => {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  const startDate = searchParamsCache.get('startDate');
  const endDate = searchParamsCache.get('endDate');
  const unitId = searchParamsCache.get('unitId');
  const includeSubUnits = searchParamsCache.get('includeSubUnits') ?? true;

  const filters = {
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(unitId && { unitId }),
    includeSubUnits
  };

  // Fetch data server-side
  let statisticsData: WorkflowStepsStatisticsResponse | null = null;
  let error: string | null = null;

  try {
    statisticsData =
      await workflowStepsStatisticsService.getWorkflowStepsStatisticsByUnit(
        filters as WorkflowStepsStatisticsQuery
      );

    if (!statisticsData) {
      error = 'فشل في تحميل بيانات إحصائيات خطوات سير العمل';
    }
  } catch (err) {
    // Error is handled by axios interceptor for server-side
    error = 'حدث خطأ أثناء تحميل إحصائيات خطوات سير العمل';
  }

  return (
    <PageContainer scrollable>
      <div className='flex flex-1 flex-col space-y-4'>
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={6} rowCount={8} filterCount={2} />
          }
        >
          <WorkflowStepsStatistics
            initialData={statisticsData || undefined}
            initialQuery={filters}
            error={error}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default page;
