import React from 'react';
import { searchParamsCache } from '@/lib/searchparams';
import { InboxList } from '@/features/correspondence/types/register-incoming-external-mail';
import { correspondenceService } from '@/features/correspondence/api/correspondence.service';
import { columns } from './inbox-list-tables/columns';
import InboxListTable from './inbox-list-tables';

export default async function MailPublicListing() {
  const page = searchParamsCache.get('page');
  const mailNum = searchParamsCache.get('mailNum');
  const pageSize = searchParamsCache.get('pageSize');
  const createdDate = searchParamsCache.get('createdDate');
  const mailDate = searchParamsCache.get('mailDate');

  // const status = searchParamsCache.get('status');

  const filters = {
    page,
    pageSize,
    ...(mailNum && { mailNum }),
    ...(createdDate && { createdDate }),
    ...(mailDate && { mailDate })
  };

  const response = await correspondenceService.getPublicMails(filters);

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
