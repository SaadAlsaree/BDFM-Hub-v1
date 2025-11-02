import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import LeaveRequestListing from '@/features/leave-request/components/leave-request-listing';
import { searchParamsCache } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';

export const metadata = {
  title: 'قائمة طلبات الإجازة',
  description: 'إدارة طلبات الإجازة'
};

type pageProps = {
  searchParams: Promise<SearchParams>;
};

const LeaveRequestPage = async (props: pageProps) => {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='طلبات الإجازة'
            description='إدارة طلبات الإجازة والموافقات'
          />
          <Link
            href='/leave-request/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <IconPlus className='mr-2 h-4 w-4' /> طلب إجازة جديد
          </Link>
        </div>
        <Separator />

        <Suspense
          fallback={
            <DataTableSkeleton columnCount={8} rowCount={8} filterCount={3} />
          }
        >
          <LeaveRequestListing />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default LeaveRequestPage;

