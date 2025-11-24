import React, { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';
import PermissionForm from '@/features/permissions/components/permission-form';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import Unauthorized from '@/components/auth/unauthorized';

export const metadata = {
  title: 'إضافة أذونات جديدة',
  description: 'إضافة أذونات جديدة'
};

const NewPermissionPage = async () => {
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
    <PageContainer>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <PermissionForm initialData={null} pageTitle='إضافة أذونات جديدة' />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default NewPermissionPage;
