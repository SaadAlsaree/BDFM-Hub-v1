import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { AnnouncementForm } from '@/features/announcements';

export const metadata = {
  title: 'إنشاء إعلان جديد'
};

export default function NewAnnouncementPage() {
  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-4'>
        <Heading title='إعلان جديد' description='إنشاء إعلان جديد في النظام' />
        <Separator />
        <AnnouncementForm initialData={null} pageTitle="بيانات الإعلان" />
      </div>
    </PageContainer>
  );
}
