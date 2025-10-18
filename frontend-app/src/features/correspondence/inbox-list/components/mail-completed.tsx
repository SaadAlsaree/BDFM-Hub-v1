import React from 'react';
import { searchParamsCache } from '@/lib/searchparams';
import { InboxList } from '@/features/correspondence/types/register-incoming-external-mail';
import { correspondenceService } from '@/features/correspondence/api/correspondence.service';
import { columns } from './inbox-list-tables/columns';
import InboxListTable from './inbox-list-tables';

export default async function MailCompleted() {
  const page = searchParamsCache.get('page');
  const mailNum = searchParamsCache.get('mailNum');
  const pageSize = searchParamsCache.get('pageSize');
  const dateFrom = searchParamsCache.get('dateFrom');
  const dateTo = searchParamsCache.get('dateTo');
  const workflowStatus = searchParamsCache.get('workflowStatus');
  const isRead = searchParamsCache.get('isRead');
  const correspondenceType = searchParamsCache.get('correspondenceType');
  // const status = searchParamsCache.get('status');

  const filters = {
    page,
    pageSize,
    ...(mailNum && { mailNum }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
    ...(workflowStatus && { workflowStatus }),
    ...(isRead && { isRead }),
    ...(correspondenceType && { correspondenceType })
  };

  const response =
    await correspondenceService.getCompletedCorrespondences(filters);

  const totalItems = response?.data?.totalCount || 0;
  const userInboxItems = (response?.data?.items || []) as InboxList[];

  return (
    <InboxListTable<InboxList, unknown>
      data={userInboxItems}
      totalItems={totalItems}
      columns={columns}
    />
  );
}
