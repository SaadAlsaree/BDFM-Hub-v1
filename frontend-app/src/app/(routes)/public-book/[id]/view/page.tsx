import PageContainer from '@/components/layout/page-container';
import PublicView from '@/features/correspondence-tags/components/public-view';
import { correspondenceService } from '@/features/correspondence/api/correspondence.service';
import { CorrespondenceDetails } from '@/features/correspondence/inbox-list/types/correspondence-details';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { hasAnyPermission, hasAnyRole } from '@/utils/auth/auth-utils';
import Unauthorized from '@/components/auth/unauthorized';
import { UserDto } from '@/utils/auth/auth';

interface PublicBookViewPageProps {
  params: Promise<{ id: string }>;
}
const PublicBookViewPage = async (props: PublicBookViewPageProps) => {
  const params = await props.params;
  const id = params.id;
  const correspondenceItem =
    await correspondenceService.getCorrespondenceById(id);
  const item = correspondenceItem?.data as CorrespondenceDetails;

  const userData = await currentUserService.getCurrentUser();
  const user = userData?.data as UserDto;

  const hasRole = hasAnyRole(user, ['Correspondence']);

  const hasPermission = hasAnyPermission(user, ['Correspondence|GetUserInbox', 'Access|All']);

  if (!hasRole && !hasPermission) {
    return <Unauthorized />;
  }

  return (
    <PageContainer>
      <div className='flex w-full flex-col gap-4'>
        <PublicView correspondenceItem={item} />
      </div>
    </PageContainer>
  );
};

export default PublicBookViewPage;
