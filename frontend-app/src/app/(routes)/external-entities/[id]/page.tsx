import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import ExternalEntityForm from '@/features/external-entities/components/external-entity-form';
import { IExternalEntityDetails } from '@/features/external-entities/types/external-entities';
import React, { Suspense } from 'react';
import { externalEntitiesService } from '@/features/external-entities/api/external-entities.service';

export const metadata = {
  title: 'تعديل الجهة الخارجية',
  description: 'تعديل الجهة الخارجية'
};

type pageProps = {
  params: Promise<{ id: string }>;
};

const ViewExternalEntityPage = async (props: pageProps) => {
  const params = await props.params;
  const data = await externalEntitiesService.getExternalEntityById(params.id);
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <ExternalEntityForm
            initialData={data?.data as IExternalEntityDetails}
            pageTitle='تعديل الجهة الخارجية'
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default ViewExternalEntityPage;
