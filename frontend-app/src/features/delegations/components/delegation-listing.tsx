import DelegationTable from './delegation-table';
import { searchParamsCache } from '@/lib/searchparams';
import { IDelegationList } from '../types/delegation';
import { delegationService } from '../api/delegation.service';
import { columns } from './delegation-table/columns';

export default async function DelegationListing() {
  const page = searchParamsCache.get('page');
  const searchText = searchParamsCache.get('searchText');
  const pageSize = searchParamsCache.get('pageSize');
  const status = searchParamsCache.get('status');
  const fromDate = searchParamsCache.get('fromDate');
  const toDate = searchParamsCache.get('toDate');
  const delegatorUserId = searchParamsCache.get('delegatorUserId');
  const permissionId = searchParamsCache.get('permissionId');
  const roleId = searchParamsCache.get('roleId');
  const isActive = searchParamsCache.get('isActive');

  const filters = {
    page,
    pageSize,
    ...(searchText && { searchText }),
    ...(status && { status: Number(status) }),
    ...(fromDate && { FromDate: fromDate }),
    ...(toDate && { ToDate: toDate }),
    ...(delegatorUserId && { DelegatorUserId: delegatorUserId }),
    ...(permissionId && { PermissionId: permissionId }),
    ...(roleId && { RoleId: roleId }),
    ...(isActive !== undefined && { isActive })
  };

  const response = await delegationService.getDelegationList(filters);
  const totalDelegations = response?.data?.totalCount || 0;
  const delegations = (response?.data?.items || []) as IDelegationList[];

  return (
    <DelegationTable<IDelegationList, unknown>
      data={delegations}
      totalItems={totalDelegations}
      columns={columns}
    />
  );
}
