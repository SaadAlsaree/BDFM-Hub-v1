import React, { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';
import MailFileForm from '@/features/mail-files/components/mail-file-form';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';

export const metadata = {
  title: 'إضافة أضبارة جديدة',
  description: 'إضافة أضبارة جديدة'
};

const NewMailFilePage = async () => {
  const data = await currentUserService.getCurrentUser();
  const user = data?.data as UserDto;

  const hasRole = hasAnyRole(user, ['FileManagement']);

  const hasPermission = hasAnyPermission(user, ['FileManagement|CreateFile']);

  if (!hasRole && !hasPermission) {
    return <Unauthorized />;
  }

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <MailFileForm initialData={null} pageTitle='إضافة أضبارة جديدة' />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default NewMailFilePage;
