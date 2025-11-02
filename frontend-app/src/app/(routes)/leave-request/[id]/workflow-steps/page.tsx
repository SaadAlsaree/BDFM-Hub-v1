import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { leaveWorkflowStepService } from '@/features/leave-workflow-step/api/leave-workflow-step.service';
import LeaveWorkflowStepList from '@/features/leave-workflow-step/components/leave-workflow-step-list';
import { LeaveWorkflowStep } from '@/features/leave-workflow-step/types/leave-workflow-step';
import React, { Suspense } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { leaveRequestService } from '@/features/leave-request/api/leave-request.service';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'خطوات مسار العمل',
  description: 'عرض خطوات مسار العمل لطلب الإجازة'
};

type PageProps = {
  params: Promise<{ id: string }>;
};

const page = async (props: PageProps) => {
  const params = await props.params;
  const requestId = params.id;

  const stepsData =
    await leaveWorkflowStepService.getLeaveWorkflowStepsByRequestId(requestId);
  const steps = (stepsData?.data || []) as LeaveWorkflowStep[];

  const requestData = await leaveRequestService.getLeaveRequestById(requestId);

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title={`خطوات مسار العمل`}
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
          <LeaveWorkflowStepList steps={steps} requestId={requestId} />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default page;
