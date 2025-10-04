import PermissionTable from './permission-table';
import { searchParamsCache } from '@/lib/searchparams';
import { IPermissionList } from '../types/permission';
import { permissionService } from '../api/permission.service';
import { columns } from './permission-table/columns';

export default async function PermissionListing() {
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

  const response = await permissionService.getPermissions(filters);
  const totalPermissions = response?.data?.totalCount || 0;
  const permissions = (response?.data?.items || []) as IPermissionList[];

  return (
    <PermissionTable<IPermissionList, unknown>
      data={permissions}
      totalItems={totalPermissions}
      columns={columns}
    />
  );
}
