import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { leaveWorkflowStepService } from '@/features/leave-workflow-step/api/leave-workflow-step.service';
import LeaveWorkflowStepList from '@/features/leave-workflow-step/components/leave-workflow-step-list';
import { LeaveWorkflowStep } from '@/features/leave-workflow-step/types/leave-workflow-step';
import React, { Suspense } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { leaveRequestService } from '@/features/leave-request/api/leave-request.service';

export const metadata = {
  title: 'تفاصيل خطوة مسار العمل',
  description: 'عرض تفاصيل خطوة مسار العمل'
};

type PageProps = {
  params: Promise<{ id: string }>;
};

const page = async (props: PageProps) => {
  const params = await props.params;
  const stepId = params.id;

  const stepData = await leaveWorkflowStepService.getLeaveWorkflowStepById(
    stepId
  );
  const step = stepData?.data as LeaveWorkflowStep;

  if (!step) {
    return (
      <PageContainer scrollable>
        <div className='flex-1 space-y-4'>
          <Heading title='خطوة مسار العمل' description='لم يتم العثور على الخطوة' />
        </div>
      </PageContainer>
    );
  }

  const requestData = await leaveRequestService.getLeaveRequestById(
    step.leaveRequestId!
  );

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title={`خطوة مسار العمل`}
            description={`طلب الإجازة: ${
              requestData?.data?.requestNumber ||
              requestData?.data?.id ||
              step.leaveRequestId
            }`}
          />
          <div className='flex gap-2'>
            <Link href={`/leave-request/${step.leaveRequestId}`}>
              <Button variant='outline'>العودة إلى الطلب</Button>
            </Link>
            <Link href={`/leave-request/${step.leaveRequestId}/workflow-steps`}>
              <Button variant='outline'>جميع الخطوات</Button>
            </Link>
          </div>
        </div>
        <Separator />
        <Suspense fallback={<FormCardSkeleton />}>
          <LeaveWorkflowStepList steps={[step]} requestId={step.leaveRequestId} />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default page;

