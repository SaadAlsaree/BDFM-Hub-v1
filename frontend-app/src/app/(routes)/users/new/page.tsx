import React from 'react';
import UserForm from '@/features/users/components/user-form';
import { roleService } from '@/features/roles/api/role.service';
import { UserRole } from '@/features/users/types/user';
import Unauthorized from '@/components/auth/unauthorized';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import PageContainer from '@/components/layout/page-container';

const NewUserPage = async () => {
  const roles = await roleService.getRoles({ Page: 1, PageSize: 100 });
  const rolesData = roles?.data?.items || [];

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
