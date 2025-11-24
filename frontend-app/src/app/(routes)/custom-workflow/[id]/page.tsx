import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { customWorkflowService } from '@/features/customWorkflow/api/customWorkflow.service';
import { CustomWorkflowViewPage } from '@/features/customWorkflow/components';
import { CustomWorkflowDetails } from '@/features/customWorkflow/types/customWorkflow';
import React, { Suspense } from 'react';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';

export const metadata = {
  title: 'عرض مسار العمل المخصص',
  description: 'عرض مسار العمل المخصص'
};

type pageProps = {
  params: Promise<{ id: string }>;
};

const ViewCustomWorkflow = async (props: pageProps) => {
  const params = await props.params;
  const data = await customWorkflowService.getCustomWorkflowById(params.id);
  const workflow = data?.data as CustomWorkflowDetails;

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
          <CustomWorkflowViewPage workflow={workflow} />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default ViewCustomWorkflow;
