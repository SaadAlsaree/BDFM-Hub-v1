import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { leaveWorkflowStepTemplateService } from '@/features/leave-workflow-step-template/api/leave-workflow-step-template.service';
import LeaveWorkflowStepTemplateForm from '@/features/leave-workflow-step-template/components/leave-workflow-step-template-form';
import { LeaveWorkflowStepTemplate } from '@/features/leave-workflow-step-template/types/leave-workflow-step-template';
import React, { Suspense } from 'react';

export const metadata = {
  title: 'تعديل قالب خطوة',
  description: 'تعديل قالب خطوة مسار العمل'
};

type PageProps = {
  params: Promise<{ id: string; templateId: string }>;
};

const page = async (props: PageProps) => {
  const params = await props.params;
  const workflowId = params.id;
  const templateId = params.templateId;

  const data =
    await leaveWorkflowStepTemplateService.getLeaveWorkflowStepTemplateById(
      templateId
    );

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <LeaveWorkflowStepTemplateForm
            initialData={data?.data as LeaveWorkflowStepTemplate}
            pageTitle='تعديل قالب خطوة'
            workflowId={workflowId}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default page;

