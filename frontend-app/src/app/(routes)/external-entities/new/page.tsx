import React, { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';
import ExternalEntityForm from '@/features/external-entities/components/external-entity-form';

export const metadata = {
  title: 'إضافة جهة خارجية جديدة',
  description: 'إضافة جهة خارجية جديدة'
};


const NewExternalEntityPage = async () => {
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
