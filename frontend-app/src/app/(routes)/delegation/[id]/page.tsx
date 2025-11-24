import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { delegationService } from '@/features/delegations/api/delegation.service';
import DelegationViewPage from '@/features/delegations/components/delegation-view-page';
import { IDelegationDetail } from '@/features/delegations/types/delegation';
import React, { Suspense } from 'react';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';

export const metadata = {
  title: 'بيانات التفويض',
  description: 'بيانات التفويض'
};

type pageProps = {
  params: Promise<{ id: string }>;
};

const ViewDelegationPage = async (props: pageProps) => {
  const params = await props.params;
  const delegation = await delegationService.getDelegationDetail(params.id);

  const userData = await currentUserService.getCurrentUser();
  const user = userData?.data as UserDto;

  const hasRole = hasAnyRole(user, ['Correspondence']);

  const hasPermission = hasAnyPermission(user, ['Correspondence|GetUserInbox']);

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
          <DelegationViewPage data={delegation?.data as IDelegationDetail} />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default ViewDelegationPage;
