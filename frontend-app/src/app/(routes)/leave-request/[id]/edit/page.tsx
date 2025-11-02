import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { leaveRequestService } from '@/features/leave-request/api/leave-request.service';
import LeaveRequestForm from '@/features/leave-request/components/leave-request-form';
import { LeaveRequest } from '@/features/leave-request/types/leave-request';
import React, { Suspense } from 'react';

export const metadata = {
  title: 'تعديل طلب الإجازة',
  description: 'تعديل طلب الإجازة'
};

const EditLeaveRequestPage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  const params = await props.params;
  const data = await leaveRequestService.getLeaveRequestById(params.id);

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <LeaveRequestForm
            initialData={data?.data as LeaveRequest}
            pageTitle='تعديل طلب الإجازة'
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default EditLeaveRequestPage;

