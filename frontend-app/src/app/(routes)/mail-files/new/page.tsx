import React, { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';
import MailFileForm from '@/features/mail-files/components/mail-file-form';

export const metadata = {
  title: 'إضافة أضبارة جديدة',
  description: 'إضافة أضبارة جديدة'
};

const NewMailFilePage = () => {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <MailFileForm
            initialData={null}
            pageTitle='إضافة أضبارة جديدة'
          />
        </Suspense>
      </div>
    </PageContainer>
  )
}

export default NewMailFilePage