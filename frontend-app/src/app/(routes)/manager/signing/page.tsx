import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import MailSigningListing from '@/features/correspondence/inbox-list/components/mail-signing-listing';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';
import { hasAllPermissions, hasAllRoles } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';

export const metadata = {
  title: 'التوقيعات'
};

// Force dynamic rendering since we use getServerSession which requires headers
export const dynamic = 'force-dynamic';

interface SigningCorrespondencePageProps {
  searchParams: Promise<SearchParams>;
}

const SigningCorrespondencePage = async (
  props: SigningCorrespondencePageProps
) => {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  const userData = await currentUserService.getCurrentUser();
  const hasRole = hasAllRoles(userData?.data as UserDto, [
    'Correspondence',
    'Manager'
  ]);

  const hasPermission = hasAllPermissions(userData?.data as UserDto, [
    'Correspondence|Get|Signing',
    'Correspondence|Manager'
  ]);

  if (!hasRole && !hasPermission) {
    return <Unauthorized />;
  }

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading title='التوقيعات' description='الكتب قيد التوقيع' />
        </div>
        <Separator />

        <Suspense
          fallback={
            <DataTableSkeleton columnCount={6} rowCount={8} filterCount={2} />
          }
        >
          <MailSigningListing />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default SigningCorrespondencePage;
