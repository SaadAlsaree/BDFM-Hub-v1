import React, { Suspense } from 'react';
import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import PermissionForm from '@/features/permissions/components/permission-form';
import { IPermissionDetail } from '@/features/permissions/types/permission';
import { permissionService } from '@/features/permissions/api/permission.service';

export const metadata = {
  title: 'تعديل الأذونات',
  description: 'تعديل الأذونات'
};

type pageProps = {
  params: Promise<{ id: string }>;
};

const EditPermissionPage = async (props: pageProps) => {
  const params = await props.params;
  const permission = await permissionService.getPermissionDetail(params.id);

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <PermissionForm
            initialData={permission?.data as IPermissionDetail}
            pageTitle='تعديل الأذونات'
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default EditPermissionPage;
