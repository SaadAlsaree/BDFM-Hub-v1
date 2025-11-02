import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import LeaveBalanceHistoryListing from '@/features/leave-balance/components/leave-balance-history-listing';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';

export const metadata = {
  title: 'سجل أرصدة الإجازات',
  description: 'عرض سجل تغييرات أرصدة الإجازات'
};

type pageProps = {
  searchParams: Promise<SearchParams>;
};

const LeaveBalancePage = async (props: pageProps) => {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='سجل أرصدة الإجازات'
            description='عرض سجل جميع التغييرات التي حدثت على أرصدة الإجازات'
          />
        </div>
        <Separator />

        <Suspense
          fallback={
            <DataTableSkeleton columnCount={8} rowCount={8} filterCount={3} />
          }
        >
          <LeaveBalanceHistoryListing />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default LeaveBalancePage;

