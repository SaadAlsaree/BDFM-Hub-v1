import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { delegationService } from '@/features/delegations/api/delegation.service';
import DelegationViewPage from '@/features/delegations/components/delegation-view-page';
import { IDelegationDetail } from '@/features/delegations/types/delegation';
import React, { Suspense } from 'react';



export const metadata = {
  title: 'بيانات التفويض',
  description: 'بيانات التفويض'
};

type pageProps = {
  params: Promise<{ id: string }>;
};


const ViewDelegationPage = async (props: pageProps) => {
  const params = await props.params;
  const delegation = await delegationService.getDelegationDetail(params.id);

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <DelegationViewPage data={delegation?.data as IDelegationDetail} />
        </Suspense>
      </div>
    </PageContainer>
  )
}

export default ViewDelegationPage