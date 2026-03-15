import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { announcementsService } from '@/features/announcements/api/announcements.service';
import { AnnouncementViewPage } from '@/features/announcements';
import { IAnnouncementDetail } from '@/features/announcements/types/announcements';
import React, { Suspense } from 'react';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import Unauthorized from '@/components/auth/unauthorized';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';

export const metadata = {
  title: 'تفاصيل الإعلان'
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ViewAnnouncementPage(props: PageProps) {
  const params = await props.params;
  const announcement = await announcementsService.getAnnouncementById(params.id);

  const data = await currentUserService.getCurrentUser();
  const user = data?.data as UserDto;

  const hasRole = hasAnyRole(user, ['Admin', 'President']);

  const hasPermission = hasAnyPermission(user, ['Correspondence|President', 'Access|All']);

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
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <AnnouncementViewPage data={announcement?.data as IAnnouncementDetail} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
