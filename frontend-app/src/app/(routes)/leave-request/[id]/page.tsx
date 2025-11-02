import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import LeaveRequestViewPage from '@/features/leave-request/components/leave-request-view-page';
import React, { Suspense } from 'react';
import { leaveRequestService } from '@/features/leave-request/api/leave-request.service';
import { LeaveRequest } from '@/features/leave-request/types/leave-request';

export const metadata = {
  title: 'تفاصيل طلب الإجازة',
  description: 'عرض تفاصيل طلب الإجازة'
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
          <LeaveRequestViewPage data={data?.data as LeaveRequest} />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default page;

