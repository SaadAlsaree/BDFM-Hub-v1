import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import MailOutgoingListing from '@/features/correspondence/inbox-list/components/mail-outgoing-listing';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';

export const metadata = {
  title: 'صادر خارجي'
};

// Force dynamic rendering since we use getServerSession which requires headers
export const dynamic = 'force-dynamic';

interface OutgoingCorrespondencePageProps {
  searchParams: Promise<SearchParams>;
}

const OutgoingCorrespondencePage = async (
  props: OutgoingCorrespondencePageProps
) => {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);
  const data = await currentUserService.getCurrentUser();
  const user = data?.data as UserDto;

  const hasRole = hasAnyRole(user, ['Correspondence']);

  const hasPermission = hasAnyPermission(user, ['Correspondence|GetUserInbox']);

  if (!hasRole && !hasPermission) {
    return <Unauthorized />;
  }
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading title='صادر خارجي' description='إدارة الكتب الصادرة' />
          <Link
            href='/correspondence/register-outgoing-external-mail'
            className={cn(buttonVariants({ variant: 'default' }))}
          >
            <IconPlus className='mr-2 h-4 w-4' />
            إضافة كتاب صادر
          </Link>
        </div>
        <Separator />
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={6} rowCount={8} filterCount={2} />
          }
        >
          <MailOutgoingListing />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default OutgoingCorrespondencePage;
