import ExternalEntityTable from './external-entity-tables';
import { searchParamsCache } from '@/lib/searchparams';
import {
  IExternalEntityList,
  IExternalEntityQuery
} from '../types/external-entities';
import { externalEntitiesService } from '../api/external-entities.service';
import { columns } from './external-entity-tables/columns';

export default async function ExternalEntityListing() {
  const page = searchParamsCache.get('page');
  const searchText = searchParamsCache.get('searchText');
  const pageSize = searchParamsCache.get('pageSize');
  const status = searchParamsCache.get('status');
  const entityType = searchParamsCache.get('entityType');

  const filters: IExternalEntityQuery = {
    page: page ?? 1,
    pageSize: pageSize ?? 10,
    ...(searchText && { searchText }),
    ...(status && { status: Number(status) }),
    ...(entityType && { entityType })
  };

  const data = await externalEntitiesService.getExternalEntities(filters);
  const totalExternalEntities = data?.data?.totalCount || 0;
  const externalEntities = (data?.data?.items || []) as IExternalEntityList[];

  return (
    <ExternalEntityTable<IExternalEntityList, unknown>
      data={externalEntities}
      totalItems={totalExternalEntities}
      columns={columns}
    />
  );
}
