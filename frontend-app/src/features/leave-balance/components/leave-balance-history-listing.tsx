import LeaveBalanceHistoryTable from './leave-balance-history-tables';
import { searchParamsCache } from '@/lib/searchparams';
import { LeaveBalanceHistory } from '../types/leave-balance';
import { leaveBalanceService } from '../api/leave-balance.service';
import { columns } from './leave-balance-history-tables/columns';

export default async function LeaveBalanceHistoryListing() {
  const page = searchParamsCache.get('page');
  const pageSize = searchParamsCache.get('pageSize');
  const employeeId = searchParamsCache.get('employeeId');
  const leaveType = searchParamsCache.get('leaveType');
  const changeDateFrom = searchParamsCache.get('changeDateFrom');
  const changeDateTo = searchParamsCache.get('changeDateTo');
  const changeType = searchParamsCache.get('changeType');

  const filters = {
    page,
    pageSize,
    ...(employeeId && { employeeId }),
    ...(leaveType && { leaveType: Number(leaveType) }),
    ...(changeDateFrom && { changeDateFrom }),
    ...(changeDateTo && { changeDateTo }),
    ...(changeType && { changeType })
  };

  const data = await leaveBalanceService.getLeaveBalanceHistory(filters);
  const totalHistory = data?.data?.totalCount || 0;
  const history = (data?.data?.items || []) as LeaveBalanceHistory[];

  return (
    <LeaveBalanceHistoryTable<LeaveBalanceHistory, unknown>
      data={history}
      totalItems={totalHistory}
      columns={columns}
    />
  );
}
