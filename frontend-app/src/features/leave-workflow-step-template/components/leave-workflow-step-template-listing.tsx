import { searchParamsCache } from '@/lib/searchparams';
import LeaveWorkflowStepTemplateTable from './leave-workflow-step-template-tables';
import { columns } from './leave-workflow-step-template-tables/columns';
import { leaveWorkflowStepTemplateService } from '@/features/leave-workflow-step-template/api/leave-workflow-step-template.service';
import { LeaveWorkflowStepTemplate } from '@/features/leave-workflow-step-template/types/leave-workflow-step-template';

type LeaveWorkflowStepTemplateListingPageProps = {
  workflowId: string;
};

export default async function LeaveWorkflowStepTemplateListingPage({
  workflowId
}: LeaveWorkflowStepTemplateListingPageProps) {
  const page = searchParamsCache.get('page');
  const pageSize = searchParamsCache.get('pageSize');

  const data = await leaveWorkflowStepTemplateService.getLeaveWorkflowStepTemplatesByWorkflowId(
    workflowId
  );
  const templates =
    (data?.data || []) as unknown as LeaveWorkflowStepTemplate[];

  return (
    <LeaveWorkflowStepTemplateTable<
      LeaveWorkflowStepTemplate,
      unknown
    >
      data={templates}
      totalItems={templates.length}
      columns={columns}
    />
  );
}

