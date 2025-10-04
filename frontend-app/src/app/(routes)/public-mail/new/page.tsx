import React, { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';
import { hasAnyPermission } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';
import CreatePublicMailForm from '@/features/correspondence/create-public-mail/components/create-public-mail-form';

export const metadata = {
  title: 'إضافة أعمام',
  description: 'إضافة أعمام'
};

// Force dynamic rendering since we use getServerSession which requires headers
export const dynamic = 'force-dynamic';

const CreatePublicMail = async () => {
  const userData = await currentUserService.getCurrentUser();
  const hasPermission = hasAnyPermission(userData?.data as UserDto, [
    'Correspondence|Create',
    'Access|All'
  ]);
  if (!hasPermission) {
    return <Unauthorized />;
  }
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <CreatePublicMailForm />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default CreatePublicMail;
