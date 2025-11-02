import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { leaveInterruptionService } from '@/features/leave-interruption/api/leave-interruption.service';
import LeaveInterruptionList from '@/features/leave-interruption/components/leave-interruption-list';
import { LeaveInterruption } from '@/features/leave-interruption/types/leave-interruption';
import React, { Suspense } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { leaveRequestService } from '@/features/leave-request/api/leave-request.service';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'قطوع طلب الإجازة',
  description: 'عرض قطوع طلب الإجازة'
};

type PageProps = {
  params: Promise<{ id: string }>;
};

const page = async (props: PageProps) => {
  const params = await props.params;
  const requestId = params.id;

  const interruptionsData =
    await leaveInterruptionService.getLeaveInterruptionsByRequestId(requestId);
  const interruptions = (interruptionsData?.data || []) as LeaveInterruption[];

  const requestData = await leaveRequestService.getLeaveRequestById(requestId);

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title={`قطوع طلب الإجازة`}
            description={`طلب الإجازة: ${
              requestData?.data?.requestNumber ||
              requestData?.data?.id ||
              requestId
            }`}
          />
          <Link href={`/leave-request/${requestId}`}>
            <Button variant='outline'>العودة إلى الطلب</Button>
          </Link>
        </div>
        <Separator />
        <Suspense fallback={<FormCardSkeleton />}>
          <LeaveInterruptionList
            interruptions={interruptions}
            requestId={requestId}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default page;
