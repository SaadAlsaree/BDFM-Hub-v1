import { searchParamsCache } from '@/lib/searchparams';
import CustomWorkflowTable from './custom-workflow-tables';
import { columns } from './custom-workflow-tables/columns';
import { customWorkflowService } from '@/features/customWorkflow/api/customWorkflow.service';
import { CustomWorkflowList } from '@/features/customWorkflow/types/customWorkflow';

type CustomWorkflowListingPage = {};

export default async function CustomWorkflowListingPage({}: CustomWorkflowListingPage) {
  // Showcasing the use of search params cache in nested RSCs
  const page = searchParamsCache.get('page');
  const searchTerm = searchParamsCache.get('workflowName');
  const pageSize = searchParamsCache.get('pageSize');
  const status = searchParamsCache.get('status');

  const filters = {
    page,
    pageSize,
    ...(searchTerm && { searchTerm }),
    ...(status && { status: Number(status) })
  };

  const data = await customWorkflowService.getCustomWorkflowList(filters);
  const totalWorkflows = data?.data?.totalCount || 0;
  const workflows = (data?.data?.items ||
    []) as unknown as CustomWorkflowList[];

  return (
    <CustomWorkflowTable<CustomWorkflowList, unknown>
      data={workflows}
      totalItems={totalWorkflows}
      columns={columns}
    />
  );
}
