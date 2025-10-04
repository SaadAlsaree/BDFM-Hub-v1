import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { permissionService } from '@/features/permissions/api/permission.service';
import PermissionViewPage from '@/features/permissions/components/permission-view';
import { IPermissionDetail } from '@/features/permissions/types/permission';
import React, { Suspense } from 'react';


export const metadata = {
  title: 'بيانات الأذونات',
  description: 'بيانات الأذونات'
};

type pageProps = {
  params: Promise<{ id: string }>;
};

const ViewPermissionPage = async (props: pageProps) => {
  const params = await props.params;
  const permission = await permissionService.getPermissionDetail(params.id)

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <PermissionViewPage data={permission?.data as IPermissionDetail} />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default ViewPermissionPage
// @END_EXAMPLE }