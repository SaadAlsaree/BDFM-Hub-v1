import { CorrespondenceDetails } from '@/features/correspondence/inbox-list/types/correspondence-details';
import TemplateView from '@/features/templates/templates/template-view';

type CorrespondenceTemplateProps = {
  correspondenceItem: CorrespondenceDetails;
};
const CorrespondenceTemplate = ({
  correspondenceItem
}: CorrespondenceTemplateProps) => {
  return <TemplateView formData={correspondenceItem} />;
};

export default CorrespondenceTemplate;
