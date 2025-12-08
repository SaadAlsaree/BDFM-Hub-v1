import { searchParamsCache } from '@/lib/searchparams';
import React from 'react';
import { tagsService } from '../api/tags.service';
import CorrespondenceTagsTable from './correspondence-tags-table';
import { columns } from './correspondence-tags-table/columns';
import { TaggedCorrespondenceItem } from '../types/tags';

const CopyFromToListing = async () => {
  const page = searchParamsCache.get('page');
  const mailNum = searchParamsCache.get('mailNum');
  const pageSize = searchParamsCache.get('pageSize');
  const category = 2; // General
  const searchTerm = searchParamsCache.get('searchTerm');
  const date = searchParamsCache.get('date');

  const filters = {
    page,
    pageSize,
    ...(mailNum && { mailNum }),
    category,
    ...(searchTerm && { searchTerm }),
    ...(date && { date })
  };

  const response = await tagsService.getCorrespondencesWithTags(filters);

  const totalItems = response?.data?.totalCount || 0;
  const correspondenceTags = (response?.data?.items ||
    []) as unknown as TaggedCorrespondenceItem[];
  return (
    <CorrespondenceTagsTable<TaggedCorrespondenceItem, unknown>
      data={correspondenceTags}
      totalItems={totalItems}
      columns={columns}
    />
  );
};

export default CopyFromToListing;
