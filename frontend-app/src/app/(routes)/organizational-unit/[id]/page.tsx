import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import OrganizationalUnitViewPage from '@/features/organizational-unit/components/organizational-unit-view-page';
import React, { Suspense } from 'react';
//service
import { organizationalService } from '@/features/organizational-unit/api/organizational.service';
import { IOrganizationalUnitDetails } from '@/features/organizational-unit/types/organizational';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';

export const metadata = {
  title: 'بيانات الجهة',
  description: 'بيانات الجهة'
};

type PageProps = {
  params: Promise<{ id: string }>;
};

const page = async (props: PageProps) => {
  const params = await props.params;
  const data = await organizationalService.getOrganizationalUnitById(params.id);

  const userData = await currentUserService.getCurrentUser();
  const user = userData?.data as UserDto;

  const hasRole = hasAnyRole(user, ['Admin']);

  const hasPermission = hasAnyPermission(user, ['Settings|GetOrganizationalUnits']);

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
          <OrganizationalUnitViewPage
            data={data?.data as IOrganizationalUnitDetails}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default page;
