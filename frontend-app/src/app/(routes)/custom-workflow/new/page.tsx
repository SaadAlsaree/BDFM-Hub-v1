import React, { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';
import { CustomWorkflowForm } from '@/features/customWorkflow/components';
import { organizationalService } from '@/features/organizational-unit/api/organizational.service';
import { IOrganizationalUnitList } from '@/features/organizational-unit/types/organizational';

export const metadata = {
  title: 'إضافة مسار جديد',
  description: 'إضافة مسار جديد'
};

// Force dynamic rendering since we use getServerSession which requires headers
export const dynamic = 'force-dynamic';

const NewCustomWorkflowPage = async () => {
  const data = await organizationalService.getOrganizationalUnits({
    page: 1,
    limit: 1000
  });
  const organizationalUnits = (data?.data?.items ||
    []) as IOrganizationalUnitList[];
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <CustomWorkflowForm
            organizationalUnits={organizationalUnits}
            initialData={null}
            pageTitle='إضافة مسار جديد'
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default NewCustomWorkflowPage;
