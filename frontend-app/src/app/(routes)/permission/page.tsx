import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import PermissionListing from '@/features/permissions/components/permission-list';
import { searchParamsCache } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';

export const metadata = {
  title: 'قائمة الأذونات'
};

type pageProps = {
  searchParams: Promise<SearchParams>;
};


const PermissionPage = async(props: pageProps) => {
  const searchParams = await props.searchParams;

  searchParamsCache.parse(searchParams);


  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading title='الأذونات' description='إدارة الأذونات' />
          <Link
            href='/permission/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <IconPlus className='mr-2 h-4 w-4' /> إضافة صلاحية جديدة
          </Link>
        </div>
        <Separator />

        <Suspense
          fallback={
            <DataTableSkeleton columnCount={6} rowCount={8} filterCount={2} />
          }
        >
          <PermissionListing />
        </Suspense>
      </div>
    </PageContainer>
  )
}

export default PermissionPage