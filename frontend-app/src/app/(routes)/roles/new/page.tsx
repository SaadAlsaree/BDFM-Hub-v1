import React, { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';
import RoleForm from '@/features/roles/components/role-form';
import { SearchParams } from 'nuqs/server';
import { searchParamsCache } from '@/lib/searchparams';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';


export const metadata = {
  title: 'إضافة صلاحية جديدة',
  description: 'إضافة صلاحية جديدة'
};


type pageProps = {
  searchParams: Promise<SearchParams>;
};

const NewRolePage = async (props: pageProps) => {

   const searchParams = await props.searchParams;
  
    searchParamsCache.parse(searchParams);
  
    const userData = await currentUserService.getCurrentUser();
    const user = userData?.data as UserDto;
  
    const hasRole = hasAnyRole(user, ['Admin']);
  
    const hasPermission = hasAnyPermission(user, ['Settings|GetRoles']);
  
    if (!hasRole && !hasPermission) {
      return <Unauthorized />;
    }
  
    if (user.isDefaultPassword === true) {
      return (
        <PageContainer scrollable={false}>
          <DefaultPasswordWarning />
        </PageContainer>
      );
    }
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <RoleForm initialData={null} pageTitle='إضافة صلاحية جديدة' />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default NewRolePage;
