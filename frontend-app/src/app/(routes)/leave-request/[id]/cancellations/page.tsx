import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { leaveCancellationService } from '@/features/leave-cancellation/api/leave-cancellation.service';
import LeaveCancellationList from '@/features/leave-cancellation/components/leave-cancellation-list';
import { LeaveCancellation } from '@/features/leave-cancellation/types/leave-cancellation';
import React, { Suspense } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { leaveRequestService } from '@/features/leave-request/api/leave-request.service';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const metadata = {
  title: 'إلغاءات طلب الإجازة',
  description: 'عرض إلغاءات طلب الإجازة'
};

type PageProps = {
  params: Promise<{ id: string }>;
};

const page = async (props: PageProps) => {
  const params = await props.params;
  const requestId = params.id;

  const cancellationsData =
    await leaveCancellationService.getLeaveCancellationsByRequestId(requestId);
  const cancellations =
    (cancellationsData?.data || []) as LeaveCancellation[];

  const requestData = await leaveRequestService.getLeaveRequestById(requestId);

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title={`إلغاءات طلب الإجازة`}
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
          <LeaveCancellationList cancellations={cancellations} />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default page;

