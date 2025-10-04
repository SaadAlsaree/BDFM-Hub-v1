import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { userService } from '@/features/users/api/user.service';
import { roleService } from '@/features/roles/api/role.service';
import { organizationalService } from '@/features/organizational-unit/api/organizational.service';
import UserView from '@/features/users/components/user-view-page';
import { UserDetailed, UserRole } from '@/features/users/types/user';
import React, { Suspense } from 'react';
import { IOrganizationalUnitList } from '@/features/organizational-unit/types/organizational';
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

  // Fetch organizational units
  const units = await organizationalService.getOrganizationalUnits({
    page: 1,
    pageSize: 100
  });
  const unitsList = units?.data?.items as IOrganizationalUnitList[];
  const parentUnits = unitsList.map((unit) => ({
    id: unit.id!,
    unitName: unit.unitName!
  }));

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <UserView
            user={data?.data as UserDetailed}
            roles={rolesData as UserRole[]}
            organizationalUnits={parentUnits}
            permissions={permissionsData as IPermissionList[]}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default UserViewPage;
