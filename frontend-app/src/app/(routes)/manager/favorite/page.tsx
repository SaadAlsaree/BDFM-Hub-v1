import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import MailIsStarredListing from '@/features/correspondence/inbox-list/components/mail-isStarred-listing';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';
import { hasAllPermissions, hasAllRoles } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';

export const metadata = {
  title: 'الكتب المفضلة'
};

// Force dynamic rendering since we use getServerSession which requires headers
export const dynamic = 'force-dynamic';

interface FavoriteCorrespondencePageProps {
  searchParams: Promise<SearchParams>;
}

const FavoriteCorrespondencePage = async (
  props: FavoriteCorrespondencePageProps
) => {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  const data = await currentUserService.getCurrentUser();
  const user = data?.data as UserDto;

  const hasRole = hasAllRoles(user, ['Correspondence', 'Manager']);

  const hasPermission = hasAllPermissions(user, [
    'Correspondence|GetUserInbox',
    'Correspondence|Manager'
  ]);

  if (!hasRole && !hasPermission) {
    return <Unauthorized />;
  }

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading title='الكتب المفضلة' description='إدارة الكتب المفضلة' />
        </div>
        <Separator />

        <Suspense
          fallback={
            <DataTableSkeleton columnCount={6} rowCount={8} filterCount={2} />
          }
        >
          <MailIsStarredListing />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default FavoriteCorrespondencePage;
