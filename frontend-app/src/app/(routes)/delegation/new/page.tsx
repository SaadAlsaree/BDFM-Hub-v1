import React, { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';
import DelegationForm from '@/features/delegations/components/delegation-form';
// services
import { roleService } from '@/features/roles/api/role.service';
import { permissionService } from '@/features/permissions/api/permission.service';
import { IRoleList } from '@/features/roles/types/role';
import { IPermissionList } from '@/features/permissions/types/permission';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import Unauthorized from '@/components/auth/unauthorized';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';

export const metadata = {
  title: 'إضافة تفويض جديدة',
  description: 'إضافة تفويض جديدة'
};

// Force dynamic rendering since we use getServerSession which requires headers
export const dynamic = 'force-dynamic';

const NewDelegationPage = async () => {
  const roles = await roleService.getRoles({ page: 1, pageSize: 100 });
  const roleList = roles?.data?.items as IRoleList[];
  const permissions = await permissionService.getPermissions({
    page: 1,
    pageSize: 100
  });
  const permissionList = permissions?.data?.items as IPermissionList[];

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
          <DelegationForm
            initialData={null}
            pageTitle='إضافة تفويض جديد'
            roles={roleList}
            permissions={permissionList}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default NewDelegationPage;
