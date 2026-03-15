import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import ExternalEntityForm from '@/features/external-entities/components/external-entity-form';
import { IExternalEntityDetails } from '@/features/external-entities/types/external-entities';
import React, { Suspense } from 'react';
import { externalEntitiesService } from '@/features/external-entities/api/external-entities.service';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';

export const metadata = {
  title: 'تعديل الجهة الخارجية',
  description: 'تعديل الجهة الخارجية'
};

type pageProps = {
  params: Promise<{ id: string }>;
};

const ViewExternalEntityPage = async (props: pageProps) => {
  const params = await props.params;
  const data = await externalEntitiesService.getExternalEntityById(params.id);

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
            initialData={data?.data as IExternalEntityDetails}
            pageTitle='تعديل الجهة الخارجية'
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default ViewExternalEntityPage;
