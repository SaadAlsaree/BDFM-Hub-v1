import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { customWorkflowService } from '@/features/customWorkflow/api/customWorkflow.service';
import { CustomWorkflowStepsManagement } from '@/features/customWorkflow/components';
import { CustomWorkflowDetails } from '@/features/customWorkflow/types/customWorkflow';
import { organizationalService } from '@/features/organizational-unit/api/organizational.service';
import OrganizationalUnitForm from '@/features/organizational-unit/components/organizational-unit-form';
import {
  IOrganizationalUnitDetails,
  IOrganizationalUnitList
} from '@/features/organizational-unit/types/organizational';
import React, { Suspense } from 'react';

export const metadata = {
  title: 'الخطوات',
  description: 'الخطوات'
};

const StepCustomWorkflow = async (props: {
  params: Promise<{ id: string }>;
}) => {
  const params = await props.params;
  const workflow = await customWorkflowService.getCustomWorkflowById(params.id);
  const workflowData = workflow?.data as CustomWorkflowDetails;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <CustomWorkflowStepsManagement workflow={workflowData} />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default StepCustomWorkflow;
