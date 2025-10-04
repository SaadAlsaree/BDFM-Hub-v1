import React, { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';
import { CorrespondenceTemplatesForm } from '@/features/correspondence-templates/components/correspondence-templates-form';

export const metadata = {
  title: 'إضافة قالب كتاب جديد',
  description: 'إضافة قالب كتاب جديد'
};

const NewCorrespondenceTemplatePage = async () => {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <CorrespondenceTemplatesForm initialData={undefined} />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default NewCorrespondenceTemplatePage;
