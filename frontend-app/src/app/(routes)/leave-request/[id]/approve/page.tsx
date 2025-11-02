import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { leaveRequestService } from '@/features/leave-request/api/leave-request.service';
import { LeaveRequest } from '@/features/leave-request/types/leave-request';
import React, { Suspense } from 'react';
import LeaveRequestApproveDialog from '@/features/leave-request/components/leave-request-approve-dialog';

export const metadata = {
  title: 'الموافقة على طلب الإجازة',
  description: 'الموافقة على طلب الإجازة'
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
          <LeaveRequestApproveDialog
            leaveRequest={data?.data as LeaveRequest}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default page;

