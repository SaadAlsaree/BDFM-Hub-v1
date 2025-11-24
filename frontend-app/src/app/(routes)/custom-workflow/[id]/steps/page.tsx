import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { customWorkflowService } from '@/features/customWorkflow/api/customWorkflow.service';
import { CustomWorkflowStepsManagement } from '@/features/customWorkflow/components';
import { CustomWorkflowDetails } from '@/features/customWorkflow/types/customWorkflow';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';
import React, { Suspense } from 'react';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';

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

  const userData = await currentUserService.getCurrentUser();
  const user = userData?.data as UserDto;

  const hasRole = hasAnyRole(user, ['Correspondence']);

  const hasPermission = hasAnyPermission(user, ['Correspondence|GetUserInbox']);

  if (!hasRole && !hasPermission) {
    return <Unauthorized />;
  }

  if (user.isDefaultPassword === true) {
    return (
      <PageContainer scrollable={false}>
        <DefaultPasswordWarning />
      </PageContainer>
    );
  }
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
