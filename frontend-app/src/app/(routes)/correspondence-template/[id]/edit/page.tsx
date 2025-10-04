import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { CorrespondenceTemplatesForm } from '@/features/correspondence-templates/components/correspondence-templates-form';
import { correspondenceTemplatesService } from '@/features/correspondence-templates/api/correspondence-templates.service';
import { CorrespondenceTemplatesDetail } from '@/features/correspondence-templates/types/correspondence-templates';
import React, { Suspense } from 'react';

export const metadata = {
  title: 'تعديل قالب المراسلات',
  description: 'تعديل قالب المراسلات'
};

type pageProps = {
  params: Promise<{ id: string }>;
};

const EditCorrespondenceTemplatePage = async (props: pageProps) => {
  const params = await props.params;
  const template =
    await correspondenceTemplatesService.getCorrespondenceTemplateById(
      params.id
    );

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <CorrespondenceTemplatesForm
            initialData={template?.data as CorrespondenceTemplatesDetail}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default EditCorrespondenceTemplatePage;
