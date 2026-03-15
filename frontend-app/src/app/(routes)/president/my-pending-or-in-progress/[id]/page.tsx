import PageContainer from '@/components/layout/page-container';
import { correspondenceService } from '@/features/correspondence/api/correspondence.service';
import { CorrespondenceDetails } from '@/features/correspondence/inbox-list/types/correspondence-details';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';
import React, { Suspense } from 'react';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import CorrespondenceView from '@/features/president/common/correspondence-view';
import FormCardSkeleton from '@/components/form-card-skeleton';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import Unauthorized from '@/components/auth/unauthorized';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

const MyPendingOrInProgressDetailPage = async (props: Props) => {
  const params = await props.params;
  const correspondence = await correspondenceService.getCorrespondenceById(
    params.id
  );
  const correspondenceDetails = correspondence?.data as CorrespondenceDetails;

  const userData = await currentUserService.getCurrentUser();
  const user = userData?.data as UserDto;

  const hasRole = hasAnyRole(user, ['President']);

  const hasPermission = hasAnyPermission(user, ['President|GetUserInbox', 'Access|All']);

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
          <CorrespondenceView data={correspondenceDetails} />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default MyPendingOrInProgressDetailPage;

