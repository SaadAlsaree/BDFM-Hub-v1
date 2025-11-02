import LeaveRequestTable from './leave-request-tables';
import { searchParamsCache } from '@/lib/searchparams';
import { LeaveRequestList } from '../types/leave-request';
import { leaveRequestService } from '../api/leave-request.service';
import { columns } from './leave-request-tables/columns';

export default async function LeaveRequestListing() {
  const page = searchParamsCache.get('page');
  const searchText = searchParamsCache.get('searchText');
  const pageSize = searchParamsCache.get('pageSize');
  const status = searchParamsCache.get('status');
  const employeeId = searchParamsCache.get('employeeId');
  const organizationalUnitId = searchParamsCache.get('organizationalUnitId');
  const leaveType = searchParamsCache.get('leaveType');

  const filters = {
    page,
    pageSize,
    ...(searchText && { searchText }),
    ...(status && { status: Number(status) }),
    ...(employeeId && { employeeId }),
    ...(organizationalUnitId && { organizationalUnitId }),
    ...(leaveType && { leaveType: Number(leaveType) })
  };

  const data = await leaveRequestService.getAllLeaveRequests(filters);
  const totalLeaveRequests = data?.data?.totalCount || 0;
  const leaveRequests = (data?.data?.items || []) as LeaveRequestList[];

  return (
    <LeaveRequestTable<LeaveRequestList, unknown>
      data={leaveRequests}
      totalItems={totalLeaveRequests}
      columns={columns}
    />
  );
}
