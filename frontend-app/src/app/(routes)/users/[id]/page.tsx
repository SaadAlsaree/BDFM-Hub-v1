import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { userService } from '@/features/users/api/user.service';
import { roleService } from '@/features/roles/api/role.service';
import UserView from '@/features/users/components/user-view-page';
import { UserDetailed, UserRole } from '@/features/users/types/user';
import React, { Suspense } from 'react';
import { userRoleService } from '@/features/users/api/userRole.service';
import { permissionService } from '@/features/permissions/api/permission.service';
import { IPermissionList } from '@/features/permissions/types/permission';

type UserViewPageProps = {
  params: Promise<{ id: string }>;
};

const UserViewPage = async (props: UserViewPageProps) => {
  const params = await props.params;
  const data = await userService.getUserById(params.id);

  // Fetch roles
  const roles = await roleService.getRoles({ page: 1, pageSize: 100 });
  const rolesData = roles?.data?.items || [];

  // Fetch permissions
  const permissions = await permissionService.getPermissions({
    page: 1,
    pageSize: 100
  });
  const permissionsData = permissions?.data?.items || [];

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <UserView
            user={data?.data as UserDetailed}
            roles={rolesData as UserRole[]}
            permissions={permissionsData as IPermissionList[]}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default UserViewPage;
