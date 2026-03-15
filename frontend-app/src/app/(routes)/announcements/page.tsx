import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { AnnouncementsList } from '@/features/announcements';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';
import { cn } from '@/lib/utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import Unauthorized from '@/components/auth/unauthorized';

export const metadata = {
  title: 'الإعلانات'
};

interface AnnouncementsPageProps {
  searchParams: Promise<SearchParams>;
}

const AnnouncementsPage = async (props: AnnouncementsPageProps) => {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  const data = await currentUserService.getCurrentUser();
  const user = data?.data as UserDto;

  const hasRole = hasAnyRole(user, ['Admin', 'President']);

  const hasPermission = hasAnyPermission(user, ['Correspondence|President', 'Access|All']);

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
          <Heading title='الإعلانات' description='إدارة إعلانات النظام' />
          <Link
            href='/announcements/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <IconPlus className='mr-2 h-4 w-4' /> إضافة إعلان جديد
          </Link>
        </div>
        <Separator />

        <Suspense
          fallback={
            <DataTableSkeleton columnCount={6} rowCount={8} filterCount={2} />
          }
        >
          <AnnouncementsList />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default AnnouncementsPage;
