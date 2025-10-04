import React, { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';
import RoleForm from '@/features/roles/components/role-form';

export const metadata = {
  title: 'إضافة صلاحية جديدة',
  description: 'إضافة صلاحية جديدة'
};

const NewRolePage = async () => {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <RoleForm initialData={null} pageTitle='إضافة صلاحية جديدة' />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default NewRolePage;
