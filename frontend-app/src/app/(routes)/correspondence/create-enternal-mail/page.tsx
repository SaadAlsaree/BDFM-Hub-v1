import React, { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';
import CreateInternalMailForm from '@/features/correspondence/create-internalMail/create-internalMail-form';
import { hasAnyPermission } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';

export const metadata = {
  title: 'إضافة كتاب داخلي جديد',
  description: 'إضافة كتاب داخلي جديد'
};

// Force dynamic rendering since we use getServerSession which requires headers
export const dynamic = 'force-dynamic';

const CreateExternalMail = async () => {
  const userData = await currentUserService.getCurrentUser();
  const hasPermission = hasAnyPermission(userData?.data as UserDto, [
    'Correspondence|Create|Internal',
    'Access|All'
  ]);
  if (!hasPermission) {
    return <Unauthorized />;
  }
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <CreateInternalMailForm />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default CreateExternalMail;
