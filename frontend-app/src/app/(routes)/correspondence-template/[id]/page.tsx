import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { CorrespondenceTemplatesViewPage } from '@/features/correspondence-templates/components/correspondence-templates-view-page';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';
import React, { Suspense } from 'react';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';

export const metadata = {
  title: 'بيانات قالب المراسلات',
  description: 'بيانات قالب المراسلات'
};

type pageProps = {
  params: Promise<{ id: string }>;
};

const ViewCorrespondenceTemplatePage = async (props: pageProps) => {
  const params = await props.params;

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
          <CorrespondenceTemplatesViewPage templateId={params.id} />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default ViewCorrespondenceTemplatePage;
