import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { announcementsService } from '@/features/announcements/api/announcements.service';
import { AnnouncementViewPage } from '@/features/announcements';
import { IAnnouncementDetail } from '@/features/announcements/types/announcements';
import React, { Suspense } from 'react';

export const metadata = {
  title: 'تفاصيل الإعلان'
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ViewAnnouncementPage(props: PageProps) {
  const params = await props.params;
  const announcement = await announcementsService.getAnnouncementById(params.id);

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
