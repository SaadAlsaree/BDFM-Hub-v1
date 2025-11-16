import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { InboxListing } from '@/features/correspondence/inbox-list/components';
import { searchParamsCache } from '@/lib/searchparams';

import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';

export const metadata = {
  title: 'صندوق الوارد'
};

// Force dynamic rendering since we use getServerSession which requires headers
export const dynamic = 'force-dynamic';

interface InboxPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function InboxPage(props: InboxPageProps) {
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
          <Heading title='جميع الكتب' description='إدارة جميع الكتب' />
          {/* <Link
            href='/correspondence/mail-form'
            className={cn(buttonVariants({ variant: 'default' }))}
          >
            <IconPlus className='mr-2 h-4 w-4' />
            إضافة كتاب جديد
          </Link> */}
        </div>
        <Separator />

        <Suspense
          fallback={
            <DataTableSkeleton columnCount={6} rowCount={8} filterCount={2} />
          }
        >
          <InboxListing />
        </Suspense>
      </div>
    </PageContainer>
  );
}
