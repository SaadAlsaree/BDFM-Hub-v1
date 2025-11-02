import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { leaveRequestService } from '@/features/leave-request/api/leave-request.service';
import { LeaveRequest } from '@/features/leave-request/types/leave-request';
import React, { Suspense } from 'react';
import LeaveRequestRejectDialog from '@/features/leave-request/components/leave-request-reject-dialog';

export const metadata = {
  title: 'رفض طلب الإجازة',
  description: 'رفض طلب الإجازة'
};

type PageProps = {
  params: Promise<{ id: string }>;
};

const page = async (props: PageProps) => {
  const params = await props.params;
  const data = await leaveRequestService.getLeaveRequestById(params.id);

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <LeaveRequestRejectDialog
            leaveRequest={data?.data as LeaveRequest}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default page;

