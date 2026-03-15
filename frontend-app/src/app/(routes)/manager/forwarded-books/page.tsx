import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import ForwardedBooksListing from '@/features/president/forwarded-books/forwarded-correspondence.listing';
import { searchParamsCache } from '@/lib/searchparams';

import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';

export const metadata = {
  title: 'الكتب المحولة'
};

// Force dynamic rendering since we use getServerSession which requires headers
export const dynamic = 'force-dynamic';

interface ForwardedBooksPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ForwardedBooksPage(
  props: ForwardedBooksPageProps
) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  const data = await currentUserService.getCurrentUser();
  const user = data?.data as UserDto;

  const hasRole = hasAnyRole(user, ['Manager', 'President', 'SuAdmin']);

  const hasPermission = hasAnyPermission(user, [
    'Correspondence|Manager',
    'Correspondence|President',
    'Access|All'
  ]);

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
          <Heading title='الكتب المحولة' description='إدارة الكتب المحولة' />
        </div>
        <Separator />

        <Suspense
          fallback={
            <DataTableSkeleton columnCount={6} rowCount={8} filterCount={2} />
          }
        >
          <ForwardedBooksListing />
        </Suspense>
      </div>
    </PageContainer>
  );
}
