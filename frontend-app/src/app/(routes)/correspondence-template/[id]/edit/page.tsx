import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { CorrespondenceTemplatesForm } from '@/features/correspondence-templates/components/correspondence-templates-form';
import { correspondenceTemplatesService } from '@/features/correspondence-templates/api/correspondence-templates.service';
import { CorrespondenceTemplatesDetail } from '@/features/correspondence-templates/types/correspondence-templates';
import React, { Suspense } from 'react';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';

export const metadata = {
  title: 'تعديل قالب المراسلات',
  description: 'تعديل قالب المراسلات'
};

type pageProps = {
  params: Promise<{ id: string }>;
};

const EditCorrespondenceTemplatePage = async (props: pageProps) => {
  const params = await props.params;
  const template =
    await correspondenceTemplatesService.getCorrespondenceTemplateById(
      params.id
    );

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
          <CorrespondenceTemplatesForm
            initialData={template?.data as CorrespondenceTemplatesDetail}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default EditCorrespondenceTemplatePage;
