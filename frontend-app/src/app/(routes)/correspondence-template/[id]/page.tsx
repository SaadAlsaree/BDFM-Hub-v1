import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { CorrespondenceTemplatesViewPage } from '@/features/correspondence-templates/components/correspondence-templates-view-page';
import React, { Suspense } from 'react';

export const metadata = {
  title: 'بيانات قالب المراسلات',
  description: 'بيانات قالب المراسلات'
};

type pageProps = {
  params: Promise<{ id: string }>;
};

const ViewCorrespondenceTemplatePage = async (props: pageProps) => {
  const params = await props.params;

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <CorrespondenceTemplatesViewPage templateId={params.id} />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default ViewCorrespondenceTemplatePage;
