import React, { Suspense } from 'react';
import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { IRoleDetails } from '@/features/roles/types/role';
import RoleForm from '@/features/roles/components/role-form';
import { roleService } from '@/features/roles/api/role.service';

export const metadata = {
  title: 'تعديل الادوار',
  description: 'تعديل الادوار'
};

type pageProps = {
  params: Promise<{ id: string }>;
};

const EditRolePage = async (props: pageProps) => {
  const params = await props.params;
  const role = await roleService.getRoleById(params.id);



  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <RoleForm
            initialData={role?.data as IRoleDetails}
            pageTitle='تعديل الدور'
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default EditRolePage;
