import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { leaveWorkflowService } from '@/features/leave-workflow/api/leave-workflow.service';
import LeaveWorkflowViewPage from '@/features/leave-workflow/components/leave-workflow-view-page';
import { LeaveWorkflow } from '@/features/leave-workflow/types/leave-workflow';
import React, { Suspense } from 'react';

export const metadata = {
  title: 'عرض مسار العمل',
  description: 'عرض تفاصيل مسار العمل'
};

type PageProps = {
  params: Promise<{ id: string }>;
};

const page = async (props: PageProps) => {
  const params = await props.params;
  const data = await leaveWorkflowService.getLeaveWorkflowById(params.id);

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <LeaveWorkflowViewPage data={data?.data as LeaveWorkflow} />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default page;

