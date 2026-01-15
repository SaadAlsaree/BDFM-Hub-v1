import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import LateBooksListing from '@/features/correspondence/inbox-list/components/late-books-listing';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';
import { searchParamsCache } from '@/lib/searchparams';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import { SearchParams } from 'nuqs/server';
import Unauthorized from '@/components/auth/unauthorized';
import { Suspense } from 'react';

export const metadata = {
  title: 'الكتب المتأخرة'
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const LateBooksPage = async (props: Props) => {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  const data = await currentUserService.getCurrentUser();
  const user = data?.data as UserDto;

  const hasRole = hasAnyRole(user, ['Correspondence']);

  const hasPermission = hasAnyPermission(user, ['Correspondence|GetUserInbox']);

  if (!hasRole || !hasPermission) {
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
          <Heading title='الكتب المتأخرة' description='إدارة الكتب المتأخرة' />
        </div>
        <Separator />

        <Suspense
          fallback={
            <DataTableSkeleton columnCount={6} rowCount={8} filterCount={2} />
          }
        >
          <LateBooksListing />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default LateBooksPage;
