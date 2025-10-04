import React from 'react';
import UserForm from '@/features/users/components/user-form';
import { roleService } from '@/features/roles/api/role.service';
import { organizationalService } from '@/features/organizational-unit/api/organizational.service';
import { UserRole } from '@/features/users/types/user';
import { IOrganizationalUnitList } from '@/features/organizational-unit/types/organizational';

const NewUserPage = async () => {
  const roles = await roleService.getRoles({ Page: 1, PageSize: 100 });
  const rolesData = roles?.data?.items || [];

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
    <div>
      <UserForm
        initialData={null}
        pageTitle='إنشاء مستخدم جديد'
        roles={rolesData as UserRole[]}
        organizationalUnits={parentUnits}
      />
    </div>
  );
};

export default NewUserPage;
