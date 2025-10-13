import React, { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';
import { CustomWorkflowForm } from '@/features/customWorkflow/components';

export const metadata = {
  title: 'إضافة مسار جديد',
  description: 'إضافة مسار جديد'
};

// Force dynamic rendering since we use getServerSession which requires headers
export const dynamic = 'force-dynamic';

const NewCustomWorkflowPage = async () => {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <CustomWorkflowForm initialData={null} pageTitle='إضافة مسار جديد' />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default NewCustomWorkflowPage;
