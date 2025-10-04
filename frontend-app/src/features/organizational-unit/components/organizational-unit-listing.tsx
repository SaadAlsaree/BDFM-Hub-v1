import OrganizationalUnitTable from './organizational-unit-tables';
import { searchParamsCache } from '@/lib/searchparams';
import { IOrganizationalUnitList } from '../types/organizational';
import { organizationalService } from '../api/organizational.service';
import { columns } from './organizational-unit-tables/columns';

export default async function OrganizationalUnitListing() {
  const page = searchParamsCache.get('page');
  const searchText = searchParamsCache.get('searchText');
  const pageSize = searchParamsCache.get('pageSize');
  const status = searchParamsCache.get('status');
  const parentUnitId = searchParamsCache.get('parentUnitId');

  const filters = {
    page,
    pageSize,
    ...(searchText && { searchText }),
    ...(status && { status: Number(status) }),
    ...(parentUnitId && { parentUnitId })
  };

  const data = await organizationalService.getOrganizationalUnits(filters);
  const totalOrganizationalUnits = data?.data?.totalCount || 0;
  const organizationalUnits = (data?.data?.items ||
    []) as IOrganizationalUnitList[];

  return (
    <OrganizationalUnitTable<IOrganizationalUnitList, unknown>
      data={organizationalUnits}
      totalItems={totalOrganizationalUnits}
      columns={columns}
    />
  );
}
