import React, { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';
import { CustomWorkflowForm } from '@/features/customWorkflow/components';
import { customWorkflowService } from '@/features/customWorkflow/api/customWorkflow.service';

export const metadata = {
  title: 'إضافة مسار جديد',
  description: 'إضافة مسار جديد'
};

// Force dynamic rendering since we use getServerSession which requires headers
export const dynamic = 'force-dynamic';

type pageProps = {
  params: Promise<{ id: string }>;
};

const EditCustomWorkflowPage = async (props: pageProps) => {
  const params = await props.params;

  const workflow = await customWorkflowService.getCustomWorkflowById(params.id);
  const initialData = workflow?.data || null;

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <CustomWorkflowForm
            initialData={initialData}
            pageTitle='إضافة مسار جديد'
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default EditCustomWorkflowPage;
