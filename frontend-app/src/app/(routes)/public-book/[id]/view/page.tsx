import PublicView from "@/features/correspondence-tags/components/public-view"
import { correspondenceService } from "@/features/correspondence/api/correspondence.service";
import { CorrespondenceDetails } from "@/features/correspondence/inbox-list/types/correspondence-details";


interface PublicBookViewPageProps {
  params: Promise<{ id: string }>;
}
const PublicBookViewPage     = async (props: PublicBookViewPageProps) => {
  const params = await props.params;
  const id = params.id;
  const correspondenceItem = await correspondenceService.getCorrespondenceById(id);
  const item = correspondenceItem?.data as CorrespondenceDetails;




  
return <PublicView correspondenceItem={item} />
  
}

export default PublicBookViewPage