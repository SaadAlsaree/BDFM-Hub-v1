import OrganizationalUnitForm from '@/features/organizational-unit/components/organizational-unit-form';
import React, { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';

export const metadata = {
  title: 'إضافة جهة جديدة',
  description: 'إضافة جهة جديدة'
};

const NewOrganizationalUnitPage = async () => {
  const data = await currentUserService.getCurrentUser();
  const user = data?.data as UserDto;

  const hasRole = hasAnyRole(user, ['Admin']);

  const hasPermission = hasAnyPermission(user, ['Settings|CreateOrganizationalUnit']);

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
      <PageContainer scrollable>
        <div className='flex-1 space-y-4'>
          <Suspense fallback={<FormCardSkeleton />}>
            <OrganizationalUnitForm
              initialData={null}
              pageTitle='إضافة جهة جديدة'
            />
          </Suspense>
        </div>
      </PageContainer>
    </div>
  );
};

export default NewOrganizationalUnitPage;
