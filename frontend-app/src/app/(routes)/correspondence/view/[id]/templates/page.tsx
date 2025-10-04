import { correspondenceService } from '@/features/correspondence/api/correspondence.service';
import { CorrespondenceDetails } from '@/features/correspondence/inbox-list/types/correspondence-details';
import TemplatesView from '@/features/templates/components/templates-view';

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
  return (
    <div className=''>
      <TemplatesView formData={correspondenceDetails} />
    </div>
  );
};

export default TemplatesPage;
