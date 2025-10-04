import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { customWorkflowService } from '@/features/customWorkflow/api/customWorkflow.service';
import { CustomWorkflowViewPage } from '@/features/customWorkflow/components';
import { CustomWorkflowDetails } from '@/features/customWorkflow/types/customWorkflow';
import React, { Suspense } from 'react';

export const metadata = {
  title: 'عرض مسار العمل المخصص',
  description: 'عرض مسار العمل المخصص'
};

type pageProps = {
  params: Promise<{ id: string }>;
};

const ViewCustomWorkflow = async (props: pageProps) => {
  const params = await props.params;
  const data = await customWorkflowService.getCustomWorkflowById(params.id);
  const workflow = data?.data as CustomWorkflowDetails;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <CustomWorkflowViewPage workflow={workflow} />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default ViewCustomWorkflow;
