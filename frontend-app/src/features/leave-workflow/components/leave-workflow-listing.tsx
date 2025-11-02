import LeaveWorkflowTable from './leave-workflow-tables';
import { searchParamsCache } from '@/lib/searchparams';
import { LeaveWorkflowList } from '../types/leave-workflow';
import { leaveWorkflowService } from '../api/leave-workflow.service';
import { columns } from './leave-workflow-tables/columns';

export default async function LeaveWorkflowListing() {
  const page = searchParamsCache.get('page');
  const searchText = searchParamsCache.get('searchText');
  const pageSize = searchParamsCache.get('pageSize');
  const triggeringUnitId = searchParamsCache.get('triggeringUnitId');
  const triggeringLeaveType = searchParamsCache.get('triggeringLeaveType');
  const isEnabled = searchParamsCache.get('isEnabled') ? true : false;

  const filters = {
    page,
    pageSize,
    ...(searchText && { searchText }),
    ...(triggeringUnitId && { triggeringUnitId }),
    ...(triggeringLeaveType && {
      triggeringLeaveType: Number(triggeringLeaveType)
    }),
    ...(isEnabled !== null && { isEnabled })
  };

  const data = await leaveWorkflowService.getLeaveWorkflowList(filters);
  const totalLeaveWorkflows = data?.data?.totalCount || 0;
  const leaveWorkflows = (data?.data?.items || []) as LeaveWorkflowList[];

  return (
    <LeaveWorkflowTable<LeaveWorkflowList, unknown>
      data={leaveWorkflows}
      totalItems={totalLeaveWorkflows}
      columns={columns}
    />
  );
}
