import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';
import { MailViewPage } from '@/features/correspondence/inbox-list/components';
import { Suspense } from 'react';
import { correspondenceService } from '@/features/correspondence/api/correspondence.service';
import { CorrespondenceDetails } from '@/features/correspondence/inbox-list/types/correspondence-details';
import { SearchParams } from 'nuqs/server';
import { searchParamsCache } from '@/lib/searchparams';

interface Props {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<SearchParams>;
}

const ViewMailDraftPage = async (props: Props) => {
  const params = await props.params;
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  const correspondence = await correspondenceService.getCorrespondenceById(
    params.id
  );
  const correspondenceDetails = correspondence?.data as CorrespondenceDetails;

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <MailViewPage data={correspondenceDetails} />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default ViewMailDraftPage;
