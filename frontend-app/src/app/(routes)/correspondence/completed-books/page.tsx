import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';
import { hasAnyPermission } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';
import MailCompleted from '@/features/correspondence/inbox-list/components/mail-completed';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';

export const metadata = {
  title: 'قائمة الكتب المكتملة',
  description: 'إدارة الكتب المكتملة'
};

// Force dynamic rendering since we use getServerSession which requires headers
export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<SearchParams>;
}

const MailCompletedPage = async (props: Props) => {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  const userData = await currentUserService.getCurrentUser();
  const hasPermission = hasAnyPermission(userData?.data as UserDto, [
    'Correspondence|GetUserInbox',
    'Access|All'
  ]);
  if (!hasPermission) {
    return <Unauthorized />;
  }
  const data = await currentUserService.getCurrentUser();
  const user = data?.data as UserDto;
  
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
            title='قائمة الكتب المكتملة'
            description='إدارة الكتب المكتملة'
          />
        </div>
        <Separator />

        <Suspense
          fallback={
            <DataTableSkeleton columnCount={6} rowCount={8} filterCount={2} />
          }
        >
          <MailCompleted />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default MailCompletedPage;
