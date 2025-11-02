import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { organizationalService } from '@/features/organizational-unit/api/organizational.service';
import OrganizationalUnitForm from '@/features/organizational-unit/components/organizational-unit-form';
import { IOrganizationalUnitDetails } from '@/features/organizational-unit/types/organizational';
import React, { Suspense } from 'react';

export const metadata = {
  title: 'تعديل الجهة',
  description: 'تعديل الجهة'
};

const EditOrganizationalUnitPage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  const params = await props.params;
  const data = await organizationalService.getOrganizationalUnitById(params.id);
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <OrganizationalUnitForm
            initialData={data?.data as IOrganizationalUnitDetails}
            pageTitle='تعديل الجهة'
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default EditOrganizationalUnitPage;
