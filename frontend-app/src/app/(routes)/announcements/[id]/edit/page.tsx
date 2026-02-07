import PageContainer from '@/components/layout/page-container';
import { AnnouncementForm, announcementsService } from '@/features/announcements';

export const metadata = {
  title: 'تعديل الإعلان'
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAnnouncementPage({ params }: PageProps) {
  const { id } = await params;
  const response = await announcementsService.getAnnouncementById(id);
  const initialData = response?.data || null;

  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-4'>
        <AnnouncementForm initialData={initialData} pageTitle="تعديل بيانات الإعلان" />
      </div>
    </PageContainer>
  );
}
