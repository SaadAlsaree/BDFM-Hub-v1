import React, { Suspense } from 'react';
import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import PermissionForm from '@/features/permissions/components/permission-form';
import { IPermissionDetail } from '@/features/permissions/types/permission';
import { permissionService } from '@/features/permissions/api/permission.service';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';
import { UserDto } from '@/utils/auth/auth';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import Unauthorized from '@/components/auth/unauthorized';
export const metadata = {
  title: 'تعديل الأذونات',
  description: 'تعديل الأذونات'
};

type pageProps = {
  params: Promise<{ id: string }>;
};

const EditPermissionPage = async (props: pageProps) => {
  const params = await props.params;
  const permission = await permissionService.getPermissionDetail(params.id);

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
          <PermissionForm
            initialData={permission?.data as IPermissionDetail}
            pageTitle='تعديل الأذونات'
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default EditPermissionPage;
