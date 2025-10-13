import CustomWorkflowTable from './custom-workflow-tables';
import { searchParamsCache } from '@/lib/searchparams';
import { CustomWorkflowItem } from '../types/custom-workflow';
import { customWorkflowService } from '../api/custom-workflow.service';
import { columns } from './custom-workflow-tables/columns';

export default async function CustomWorkflowListing() {
  const page = searchParamsCache.get('page');
  const searchTerm = searchParamsCache.get('searchTerm');
  const pageSize = searchParamsCache.get('pageSize');
  const status = searchParamsCache.get('status');

  const filters = {
    page,
    pageSize,
    ...(searchTerm && { searchTerm }),
    ...(status && { status: Number(status) })
  };

  const response = await customWorkflowService.getCustomWorkflows(filters);
  const totalItems = response?.data?.totalCount || 0;
  const items = (response?.data?.items ||
    []) as unknown as CustomWorkflowItem[];

  return (
    <CustomWorkflowTable<CustomWorkflowItem, unknown>
      data={items}
      totalItems={totalItems}
      columns={columns}
    />
  );
}
