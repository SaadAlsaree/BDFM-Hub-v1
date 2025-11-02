import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import LeaveWorkflowForm from '@/features/leave-workflow/components/leave-workflow-form';
import React, { Suspense } from 'react';

export const metadata = {
  title: 'مسار عمل جديد',
  description: 'إنشاء مسار عمل جديد للإجازات'
};

const NewLeaveWorkflowPage = async () => {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <LeaveWorkflowForm initialData={null} pageTitle='مسار عمل جديد' />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default NewLeaveWorkflowPage;

