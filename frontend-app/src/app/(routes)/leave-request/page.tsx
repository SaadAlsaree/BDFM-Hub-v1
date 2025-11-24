import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import LeaveRequestListing from '@/features/leave-request/components/leave-request-listing';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';
import { searchParamsCache } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';
import Unauthorized from '@/components/auth/unauthorized';

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

  const data = await currentUserService.getCurrentUser();
  const user = data?.data as UserDto;

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
