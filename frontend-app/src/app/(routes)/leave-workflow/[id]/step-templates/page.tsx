import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { leaveWorkflowStepTemplateService } from '@/features/leave-workflow-step-template/api/leave-workflow-step-template.service';
import { leaveWorkflowService } from '@/features/leave-workflow/api/leave-workflow.service';
import LeaveWorkflowStepTemplateViewPage from '@/features/leave-workflow-step-template/components/leave-workflow-step-template-view-page';
import { LeaveWorkflowStepTemplate } from '@/features/leave-workflow-step-template/types/leave-workflow-step-template';
import React, { Suspense } from 'react';

export const metadata = {
  title: 'إدارة قوالب خطوات مسار العمل',
  description: 'إدارة قوالب خطوات مسار العمل'
};

type PageProps = {
  params: Promise<{ id: string }>;
};

const page = async (props: PageProps) => {
  const params = await props.params;
  const workflowId = params.id;

  const templatesData =
    await leaveWorkflowStepTemplateService.getLeaveWorkflowStepTemplatesByWorkflowId(
      workflowId
    );
  const templates =
    (templatesData?.data || []) as LeaveWorkflowStepTemplate[];

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <LeaveWorkflowStepTemplateViewPage
            workflowId={workflowId}
            templates={templates}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default page;

