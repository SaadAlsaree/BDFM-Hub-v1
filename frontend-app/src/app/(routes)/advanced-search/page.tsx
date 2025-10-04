import React, { Suspense } from 'react';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { AdvancedSearchListing } from '@/features/advanced-search';

export const metadata = {
  title: 'البحث المتقدم'
};

type SearchPageProps = {
  searchParams: Promise<SearchParams>;
};

const SearchPage = async (props: SearchPageProps) => {
  const searchParams = await props.searchParams;
  // Allow nested RSCs to access the search params (in a type-safe way)
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading title='البحث المتقدم' description='البحث المتقدم' />
        </div>

        <Separator />
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={6} rowCount={8} filterCount={2} />
          }
        >
          <AdvancedSearchListing />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default SearchPage;
