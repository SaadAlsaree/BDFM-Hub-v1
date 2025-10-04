import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import OrganizationalUnitListing from '@/features/organizational-unit/components/organizational-unit-listing';
import { searchParamsCache } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { OrganizationalUnitFlow } from '@/features/organizational-unit/components/OrganizationalUnitFlow';

export const metadata = {
  title: 'قائمة الجهات'
};

type pageProps = {
  searchParams: Promise<SearchParams>;
};

const OrganizationalUnitPage = async (props: pageProps) => {
  const searchParams = await props.searchParams;
  // Allow nested RSCs to access the search params (in a type-safe way)
  searchParamsCache.parse(searchParams);

  // const orgTree = await organizationalService.getOrganizationalUnitTree();

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading title='الجهات' description='إدارة الجهات ووصولاتها' />
          <Link
            href='/organizational-unit/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <IconPlus className='mr-2 h-4 w-4' /> إضافة جهة جديدة
          </Link>
        </div>
        <Separator />

        <Suspense
          fallback={
            <DataTableSkeleton columnCount={6} rowCount={8} filterCount={2} />
          }
        >
          <OrganizationalUnitListing />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default OrganizationalUnitPage;
