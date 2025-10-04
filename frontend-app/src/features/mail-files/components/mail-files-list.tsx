import MailFilesTable from './mail-files-tables';
import { searchParamsCache } from '@/lib/searchparams';
import { IMailFileList } from '../types/mail-files';
import { mailFilesService } from '../api/mail-files.service';
import { columns } from './mail-files-tables/columns';

export default async function MailFilesList() {
  const page = searchParamsCache.get('page');
  const searchTerm = searchParamsCache.get('searchTerm');
  const pageSize = searchParamsCache.get('pageSize');
  const status = searchParamsCache.get('status');
  const fromDate = searchParamsCache.get('fromDate');
  const toDate = searchParamsCache.get('toDate');

  const filters = {
    page,
    pageSize,
    ...(searchTerm && { searchTerm: searchTerm }),
    ...(status && { statusId: Number(status) }),
    ...(fromDate && { fromDate }),
    ...(toDate && { toDate })
  };

  const response = await mailFilesService.getMailFiles(filters);
  const totalMailFiles = response?.data?.totalCount || 0;
  const mailFiles = (response?.data?.items || []) as IMailFileList[];

  return (
    <MailFilesTable<IMailFileList, unknown>
      data={mailFiles}
      totalItems={totalMailFiles}
      columns={columns}
    />
  );
}
