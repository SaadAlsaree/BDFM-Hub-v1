import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import OrganizationalUnitViewPage from '@/features/organizational-unit/components/organizational-unit-view-page';
import React, { Suspense } from 'react';
//service
import { organizationalService } from '@/features/organizational-unit/api/organizational.service';
import { IOrganizationalUnitDetails } from '@/features/organizational-unit/types/organizational';

export const metadata = {
  title: 'بيانات الجهة',
  description: 'بيانات الجهة'
};

type PageProps = {
  params: Promise<{ id: string }>;
};

const page = async (props: PageProps) => {
  const params = await props.params;
  const data = await organizationalService.getOrganizationalUnitById(params.id);

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <OrganizationalUnitViewPage
            data={data?.data as IOrganizationalUnitDetails}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default page;
