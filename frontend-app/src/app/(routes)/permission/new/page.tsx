import React, { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';
import PermissionForm from '@/features/permissions/components/permission-form';

export const metadata = {
  title: 'إضافة أذونات جديدة',
  description: 'إضافة أذونات جديدة'
};

const NewPermissionPage = () => {
  return (
    <PageContainer>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <PermissionForm initialData={null} pageTitle='إضافة أذونات جديدة' />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default NewPermissionPage;
