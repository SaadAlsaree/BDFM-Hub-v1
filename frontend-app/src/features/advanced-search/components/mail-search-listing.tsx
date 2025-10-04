import React from 'react';
import { searchParamsCache } from '@/lib/searchparams';
import { InboxList } from '@/features/correspondence/types/register-incoming-external-mail';
import { advancedSearchService } from '../api/advanced-search.service';
import SearchTable from './search-tables';
import { columns } from './search-tables/columns';

const MailSearchListing = async () => {
  const page = searchParamsCache.get('page');
  const pageSize = searchParamsCache.get('pageSize');
  const organizationalUnitId = searchParamsCache.get('organizationalUnitId');
  const mailNum = searchParamsCache.get('mailNum');
  const fromDate = searchParamsCache.get('fromDate');
  const toDate = searchParamsCache.get('toDate');
  const subject = searchParamsCache.get('subject');
  const bodyText = searchParamsCache.get('bodyText');
  const externalReferenceNumber = searchParamsCache.get(
    'externalReferenceNumber'
  );
  const externalReferenceDate = searchParamsCache.get('externalReferenceDate');
  const externalEntityId = searchParamsCache.get('externalEntityId');
  const fileNumber = searchParamsCache.get('fileNumber');
  const secrecyLevel = searchParamsCache.get('secrecyLevel');
  const priorityLevel = searchParamsCache.get('priorityLevel');
  const personalityLevel = searchParamsCache.get('personalityLevel');

  const filters = {
    page,
    pageSize,
    ...(organizationalUnitId && { organizationalUnitId }),
    ...(mailNum && { mailNum }),
    ...(fromDate && { fromDate }),
    ...(toDate && { toDate }),
    ...(subject && { subject }),
    ...(bodyText && { bodyText }),
    ...(externalReferenceNumber && { externalReferenceNumber }),
    ...(externalReferenceDate && { externalReferenceDate }),
    ...(externalEntityId && { externalEntityId }),
    ...(fileNumber && { fileNumber }),
    ...(secrecyLevel && { secrecyLevel: Number(secrecyLevel) }),
    ...(priorityLevel && { priorityLevel: Number(priorityLevel) }),
    ...(personalityLevel && { personalityLevel: Number(personalityLevel) })
  };

  const response = await advancedSearchService.searchCorrespondences(filters);

  const totalItems = response?.data?.totalCount || 0;
  const userInboxItems = (response?.data?.items || []) as InboxList[];

  return (
    <SearchTable<InboxList, unknown>
      data={userInboxItems}
      totalItems={totalItems}
      columns={columns}
    />
  );
};

export default MailSearchListing;
