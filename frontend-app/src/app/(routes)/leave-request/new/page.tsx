import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import LeaveRequestForm from '@/features/leave-request/components/leave-request-form';
import React, { Suspense } from 'react';

export const metadata = {
  title: 'طلب إجازة جديد',
  description: 'إنشاء طلب إجازة جديد'
};

const NewLeaveRequestPage = async () => {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <LeaveRequestForm initialData={null} pageTitle='طلب إجازة جديد' />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default NewLeaveRequestPage;

