import React from 'react';
import UserForm from '@/features/users/components/user-form';
import { roleService } from '@/features/roles/api/role.service';
import { UserRole } from '@/features/users/types/user';

const NewUserPage = async () => {
  const roles = await roleService.getRoles({ Page: 1, PageSize: 100 });
  const rolesData = roles?.data?.items || [];

  return (
    <div>
      <UserForm
        initialData={null}
        pageTitle='إنشاء مستخدم جديد'
        roles={rolesData as UserRole[]}
      />
    </div>
  );
};

export default NewUserPage;
