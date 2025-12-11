import { CorrespondenceDetails } from '@/features/correspondence/inbox-list/types/correspondence-details';
import TemplateView from '@/features/templates/templates/template-view';

type PublicTemplateProps = {
  correspondenceItem: CorrespondenceDetails;
};
const PublicTemplate = ({ correspondenceItem }: PublicTemplateProps) => {
  return <TemplateView formData={correspondenceItem} />;
};

export default PublicTemplate;
