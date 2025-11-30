import { Suspense } from 'react';
import { SearchParams } from 'nuqs/server';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { CorrespondencesSummary } from '@/features/correspondences-summary/Components/correspondences-summary';
import { correspondencesSummaryService } from '@/features/correspondences-summary/api/correspondences-summary.service';
import {
  UnitCorrespondenceSummaryQuery,
  UnitCorrespondenceSummaryResponse
} from '@/features/correspondences-summary/types/correspondences-summary';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';
import { CorrespondenceTypeEnum } from '@/features/correspondence/types/register-incoming-external-mail';

export const metadata = {
  title: 'ملخص كنب التشكيلات'
};

// Force dynamic rendering since we use getServerSession which requires headers
export const dynamic = 'force-dynamic';

interface CorrespondencesSummaryPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function CorrespondencesSummaryPage(
  props: CorrespondencesSummaryPageProps
) {
  const searchParams = await props.searchParams;

  // Parse search params
  const unitId = searchParams.unitId as string | undefined;
  const startDate = searchParams.startDate as string | undefined;
  const endDate = searchParams.endDate as string | undefined;
  const correspondenceType = searchParams.correspondenceType
    ? Number(searchParams.correspondenceType)
    : undefined;
  const includeSubUnitsParam = searchParams.includeSubUnits;
  const includeSubUnits =
    includeSubUnitsParam === 'true' || includeSubUnitsParam === '1';

  // Build query
  const query: UnitCorrespondenceSummaryQuery = {
    unitId,
    startDate,
    endDate,
    correspondenceType:
      correspondenceType !== undefined
        ? (correspondenceType as CorrespondenceTypeEnum)
        : undefined,
    includeSubUnits: includeSubUnits || false
  };

  // Fetch data server-side
  let summaryData: UnitCorrespondenceSummaryResponse | null = null;
  let error: string | null = null;

  try {
    const response = await correspondencesSummaryService.getCorrespondencesSummaryByUnits(
      query
    );

    if (response?.data) {
      summaryData = response.data as UnitCorrespondenceSummaryResponse;
    } else {
      error = 'فشل في تحميل بيانات ملخص المراسلات';
    }
  } catch (err) {
    // Error is handled by axios interceptor for server-side
    error = 'حدث خطأ أثناء تحميل ملخص المراسلات';
  }

  // Check user permissions
  const userData = await currentUserService.getCurrentUser();
  const user = userData?.data as UserDto;

  const hasRole = hasAnyRole(user, ['Correspondence']);

  const hasPermission = hasAnyPermission(user, ['Correspondence|Manage']);

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
    <PageContainer >
      <div className='flex flex-1 flex-col space-y-4'>
       

 

        <Suspense
          fallback={
            <DataTableSkeleton columnCount={6} rowCount={8} filterCount={2} />
          }
        >
          <CorrespondencesSummary
            initialData={summaryData || undefined}
            initialQuery={query}
            error={error}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
}

