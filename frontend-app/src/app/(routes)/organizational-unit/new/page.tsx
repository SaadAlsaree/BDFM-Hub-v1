import OrganizationalUnitForm from '@/features/organizational-unit/components/organizational-unit-form';
import React, { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';

export const metadata = {
  title: 'إضافة جهة جديدة',
  description: 'إضافة جهة جديدة'
};

const NewOrganizationalUnitPage = async () => {
  return (
    <div>
      <PageContainer scrollable>
        <div className='flex-1 space-y-4'>
          <Suspense fallback={<FormCardSkeleton />}>
            <OrganizationalUnitForm
              initialData={null}
              pageTitle='إضافة جهة جديدة'
            />
          </Suspense>
        </div>
      </PageContainer>
    </div>
  );
};

export default NewOrganizationalUnitPage;
