import { searchParamsCache } from '@/lib/searchparams';
import { forwardedCorrespondenceService } from '@/features/forwarded-correspondence/api/forwarded-correspondence.service';
import { ForwardedCorrespondenceItem } from '@/features/forwarded-correspondence/types/forwarded-correspondence';
import { columns } from './forwarded-correspondence-table/columns';
import ForwardedBooksTable from './forwarded-correspondence-table';

export default async function ForwardedBooksListing() {
  const page = searchParamsCache.get('page');
  const mailNum = searchParamsCache.get('mailNum');
  const pageSize = searchParamsCache.get('pageSize');
  const receivedDate = searchParamsCache.get('receivedDate');
  const priorityLevel = searchParamsCache.get('priorityLevel');
  const secrecyLevel = searchParamsCache.get('secrecyLevel');
  const dueDate = searchParamsCache.get('dueDate');
  const fileNumber = searchParamsCache.get('fileNumber');
  const correspondenceType = searchParamsCache.get('correspondenceType');
  const correspondenceStatus = searchParamsCache.get('correspondenceStatus');
  const searchTerm = searchParamsCache.get('searchTerm');

  const filters = {
    page,
    pageSize,
    ...(mailNum && { mailNum }),
    ...(receivedDate && { receivedDate }),
    ...(priorityLevel && { priorityLevel }),
    ...(secrecyLevel && { secrecyLevel }),
    ...(dueDate && { dueDate }),
    ...(fileNumber && { fileNumber }),
    ...(correspondenceType && { correspondenceType }),
    ...(searchTerm && { searchTerm }),
    ...(correspondenceStatus && { correspondenceStatus })
  };

  const response =
    await forwardedCorrespondenceService.getForwardedCorrespondence(filters);

  const totalItems = response?.data?.totalCount || 0;
  const forwardedCorrespondenceItems = (response?.data?.items ||
    []) as ForwardedCorrespondenceItem[];

  return (
    <ForwardedBooksTable<ForwardedCorrespondenceItem, unknown>
      data={forwardedCorrespondenceItems}
      totalItems={totalItems}
      columns={columns}
    />
  );
}
