import { searchParamsCache } from '@/lib/searchparams';
import { correspondenceTemplatesService } from '../api/correspondence-templates.service';
import { CorrespondenceTemplatesList } from '../types/correspondence-templates';
import CorrespondenceTemplatesTable from './correspondence-templates-tables';
import { columns } from './correspondence-templates-tables/columns';

const CorrespondenceTemplatesListing = async () => {
  const page = searchParamsCache.get('page');
  const pageSize = searchParamsCache.get('pageSize');
  const status = searchParamsCache.get('status');
  const searchText = searchParamsCache.get('searchText');

  const filters = {
    page,
    pageSize,
    ...(status && { status: Number(status) }),
    ...(searchText && { searchText })
  };

  const data =
    await correspondenceTemplatesService.getCorrespondenceTemplates(filters);
  const totalCorrespondenceTemplates = data?.data?.totalCount || 0;
  const correspondenceTemplates = (data?.data?.items ||
    []) as CorrespondenceTemplatesList[];

  return (
    <CorrespondenceTemplatesTable<CorrespondenceTemplatesList, unknown>
      data={correspondenceTemplates}
      totalItems={totalCorrespondenceTemplates}
      columns={columns}
    />
  );
};

export default CorrespondenceTemplatesListing;
