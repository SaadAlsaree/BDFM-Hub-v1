import RoleTable from './role-tables';
import { searchParamsCache } from '@/lib/searchparams';
import { IRoleList } from '../types/role';
import { roleService } from '../api/role.service';
import { columns } from './role-tables/columns';

export default async function RoleListing() {
  const page = searchParamsCache.get('page');
  const searchText = searchParamsCache.get('searchText');
  const pageSize = searchParamsCache.get('pageSize');
  const status = searchParamsCache.get('status');

  const filters = {
    page,
    pageSize,
    ...(searchText && { searchText }),
    ...(status && { status: Number(status) })
  };

  const response = await roleService.getRoles(filters);
  const totalRoles = response?.data?.totalCount || 0;
  const roles = (response?.data?.items || []) as IRoleList[];

  return (
    <RoleTable<IRoleList, unknown>
      data={roles}
      totalItems={totalRoles}
      columns={columns}
    />
  );
}
