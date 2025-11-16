import PageContainer from '@/components/layout/page-container';
import { correspondenceService } from '@/features/correspondence/api/correspondence.service';
import { CorrespondenceDetails } from '@/features/correspondence/inbox-list/types/correspondence-details';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';
import TemplatesView from '@/features/templates/components/templates-view';
import { UserDto } from '@/utils/auth/auth';
import { currentUserService } from '@/utils/auth/corent-user.service';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

const TemplatesPage = async (props: Props) => {
  const params = await props.params;
  const correspondence = await correspondenceService.getCorrespondenceById(
    params.id
  );
  const correspondenceDetails = correspondence?.data as CorrespondenceDetails;
  const data = await currentUserService.getCurrentUser();
  const user = data?.data as UserDto;
  
  if (user.isDefaultPassword === true) {
    return (
      <PageContainer scrollable={false}>
        <DefaultPasswordWarning />
      </PageContainer>
    );
  }
    return (
    <div className=''>
      <TemplatesView formData={correspondenceDetails} />
    </div>
  );
};

export default TemplatesPage;
