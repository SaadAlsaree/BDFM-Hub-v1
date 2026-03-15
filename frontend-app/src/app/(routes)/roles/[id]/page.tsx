import Unauthorized from '@/components/auth/unauthorized';
import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { permissionService } from '@/features/permissions/api/permission.service';
import { IPermissionList } from '@/features/permissions/types/permission';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';
import { roleService } from '@/features/roles/api/role.service';
import RoleViewPage from '@/features/roles/components/role-view-page';
import { IRoleDetails } from '@/features/roles/types/role';
import { UserDto } from '@/utils/auth/auth';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import React, { Suspense } from 'react';

export const metadata = {
  title: 'بيانات الصلاحية',
  description: 'بيانات الصلاحية'
};

type pageProps = {
  params: Promise<{ id: string }>;
};

const ViewRolePage = async (props: pageProps) => {
  const params = await props.params;
  const role = await roleService.getRoleById(params.id);

  const userData = await currentUserService.getCurrentUser();
  const user = userData?.data as UserDto;
    
      const hasRole = hasAnyRole(user, ['Admin']);
    
      const hasPermission = hasAnyPermission(user, ['Settings|GetRoles']);


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

  const permissions = await permissionService.getPermissions({
    page: 1,
    pageSize: 100
  });
  const permissionList = permissions?.data?.items as IPermissionList[];

  // const rolePermissions = await rolePermissionService.getPermissionsForARoleById(params.id,{page: 1, pageSize: 100});
  // const rolePermissionList = rolePermissions?.data?.items as IPermissionList[];

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <RoleViewPage
            data={role?.data as IRoleDetails}
            permissions={permissionList}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default ViewRolePage;
