import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { delegationService } from '@/features/delegations/api/delegation.service';
import DelegationForm from '@/features/delegations/components/delegation-form';
import { IDelegationDetail } from '@/features/delegations/types/delegation';
import { permissionService } from '@/features/permissions/api/permission.service';
import { IPermissionList } from '@/features/permissions/types/permission';
import { roleService } from '@/features/roles/api/role.service';
import { IRoleList } from '@/features/roles/types/role';
import React, { Suspense } from 'react';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';

export const metadata = {
  title: 'تعديل التفويض',
  description: 'تعديل التفويض'
};

type pageProps = {
  params: Promise<{ id: string }>;
};

const EditDelegationPage = async (props: pageProps) => {
  const params = await props.params;
  const delegation = await delegationService.getDelegationDetail(params.id);

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
            initialData={delegation?.data as IDelegationDetail}
            pageTitle='تعديل التفويض'
            roles={roleList}
            permissions={permissionList}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default EditDelegationPage;
