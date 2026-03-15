import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { permissionService } from '@/features/permissions/api/permission.service';
import PermissionViewPage from '@/features/permissions/components/permission-view';
import { IPermissionDetail } from '@/features/permissions/types/permission';
import React, { Suspense } from 'react';
import Unauthorized from '@/components/auth/unauthorized';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';

export const metadata = {
  title: 'بيانات الأذونات',
  description: 'بيانات الأذونات'
};

type pageProps = {
  params: Promise<{ id: string }>;
};

const ViewPermissionPage = async (props: pageProps) => {
  const params = await props.params;
  const permission = await permissionService.getPermissionDetail(params.id);

  const userData = await currentUserService.getCurrentUser();
  const user = userData?.data as UserDto;

  const hasRole = hasAnyRole(user, ['Admin']);

  const hasPermission = hasAnyPermission(user, ['Security|GetPermissions']);

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
          <PermissionViewPage data={permission?.data as IPermissionDetail} />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default ViewPermissionPage;
// @END_EXAMPLE }
