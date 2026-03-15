import React, { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';
import ExternalEntityForm from '@/features/external-entities/components/external-entity-form';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';

export const metadata = {
  title: 'إضافة جهة خارجية جديدة',
  description: 'إضافة جهة خارجية جديدة'
};

const NewExternalEntityPage = async () => {
  const userData = await currentUserService.getCurrentUser();
  const user = userData?.data as UserDto;

  const hasRole = hasAnyRole(user, ['Admin', 'SuAdmin']);

  const hasPermission = hasAnyPermission(user, ['Settings|GetExternalEntities']);

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
          <ExternalEntityForm
            initialData={null}
            pageTitle='إضافة جهة خارجية جديدة'
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default NewExternalEntityPage;
