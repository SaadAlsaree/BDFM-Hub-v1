import PageContainer from '@/components/layout/page-container';
import { AnnouncementForm, announcementsService } from '@/features/announcements';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import Unauthorized from '@/components/auth/unauthorized';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';

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
        <AnnouncementForm initialData={initialData} pageTitle="تعديل بيانات الإعلان" />
      </div>
    </PageContainer>
  );
}
