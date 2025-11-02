import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { leaveWorkflowService } from '@/features/leave-workflow/api/leave-workflow.service';
import LeaveWorkflowForm from '@/features/leave-workflow/components/leave-workflow-form';
import { LeaveWorkflow } from '@/features/leave-workflow/types/leave-workflow';
import React, { Suspense } from 'react';

export const metadata = {
  title: 'تعديل مسار العمل',
  description: 'تعديل مسار العمل'
};

const EditLeaveWorkflowPage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  const params = await props.params;
  const data = await leaveWorkflowService.getLeaveWorkflowById(params.id);

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <LeaveWorkflowForm
            initialData={data?.data as LeaveWorkflow}
            pageTitle='تعديل مسار العمل'
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default EditLeaveWorkflowPage;

