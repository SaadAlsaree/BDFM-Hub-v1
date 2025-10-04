import OrganizationalUnitForm from '@/features/organizational-unit/components/organizational-unit-form';
import React, { Suspense } from 'react';
import { organizationalService } from '@/features/organizational-unit/api/organizational.service';
import { IOrganizationalUnitList } from '@/features/organizational-unit/types/organizational';
import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';

export const metadata = {
  title: 'إضافة جهة جديدة',
  description: 'إضافة جهة جديدة'
};

const NewOrganizationalUnitPage = async () => {
  const units = await organizationalService.getOrganizationalUnits({
    page: 1,
    pageSize: 100
  });
  const unitsList = units?.data?.items as IOrganizationalUnitList[];
  const parentUnits = unitsList.map((unit) => ({
    id: unit.id!,
    unitName: unit.unitName!
  }));
  return (
    <div>
      <PageContainer scrollable>
        <div className='flex-1 space-y-4'>
          <Suspense fallback={<FormCardSkeleton />}>
            <OrganizationalUnitForm
              initialData={null}
              pageTitle='إضافة جهة جديدة'
              parentUnits={parentUnits}
            />
          </Suspense>
        </div>
      </PageContainer>
    </div>
  );
};

export default NewOrganizationalUnitPage;
