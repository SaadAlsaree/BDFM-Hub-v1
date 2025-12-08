import { searchParamsCache } from '@/lib/searchparams';
import { InboxList } from '@/features/correspondence/types/register-incoming-external-mail';
import { correspondenceService } from '@/features/correspondence/api/correspondence.service';
import { columns } from './inbox-list-tables/columns';
import InboxListTable from './inbox-list-tables';

export default async function GetMyPendingOrInProgressListing() {
  const page = searchParamsCache.get('page');
  const mailNum = searchParamsCache.get('mailNum');
  const pageSize = searchParamsCache.get('pageSize');
  const receivedDate = searchParamsCache.get('receivedDate');
  const priorityLevel = searchParamsCache.get('priorityLevel');
  const secrecyLevel = searchParamsCache.get('secrecyLevel');
  const maileDate = searchParamsCache.get('maileDate');
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
    ...(maileDate && { maileDate }),
    ...(dueDate && { dueDate }),
    ...(fileNumber && { fileNumber }),
    ...(correspondenceType && { correspondenceType }),
    ...(searchTerm && { searchTerm }),
    ...(correspondenceStatus && { correspondenceStatus })
  };

  const response = await correspondenceService.getMyPendingOrInProgressCorrespondences(filters);

  const totalItems = response?.data?.totalCount || 0;
  const myPendingOrInProgressItems = (response?.data?.items || []) as InboxList[];

  return (
    <InboxListTable<InboxList, unknown>
      data={myPendingOrInProgressItems}
      totalItems={totalItems}
      columns={columns}
    />
  );
}

