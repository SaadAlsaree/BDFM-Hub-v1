import AnnouncementTable from './announcements-tables';
import { searchParamsCache } from '@/lib/searchparams';
import { IAnnouncementList } from '../types/announcements';
import { announcementsService } from '../api/announcements.service';
import { columns } from './announcements-tables/columns';

export default async function AnnouncementsList() {
  const page = searchParamsCache.get('page');
  const searchTerm = searchParamsCache.get('searchTerm');
  const pageSize = searchParamsCache.get('pageSize');

  const filters = {
    page,
    pageSize,
    ...(searchTerm && { searchTerm: searchTerm })
  };

  const response = await announcementsService.getAnnouncements(filters);
  const items = (response?.data?.items || []) as IAnnouncementList[];
  const totalCount = response?.data?.totalCount || 0;

  return (
    <AnnouncementTable 
      data={items} 
      totalItems={totalCount} 
      columns={columns}
    />
  );
}
