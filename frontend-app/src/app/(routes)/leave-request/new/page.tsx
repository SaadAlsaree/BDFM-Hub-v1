import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import LeaveRequestForm from '@/features/leave-request/components/leave-request-form';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import React, { Suspense } from 'react';
import Unauthorized from '@/components/auth/unauthorized';

export const metadata = {
  title: 'طلب إجازة جديد',
  description: 'إنشاء طلب إجازة جديد'
};

const NewLeaveRequestPage = async () => {
  const data = await currentUserService.getCurrentUser();
  const user = data?.data as UserDto;

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
          <LeaveRequestForm initialData={null} pageTitle='طلب إجازة جديد' />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default NewLeaveRequestPage;
