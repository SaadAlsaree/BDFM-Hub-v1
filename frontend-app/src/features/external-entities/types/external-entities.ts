export interface IExternalEntityList {
  id?: string;
  entityName?: string;
  entityCode?: string;
  entityType?: number;
  entityTypeName?: string;
  status?: number;
  statusName?: string;
  createAt?: string; // ISO 8601 date format
}

export interface IExternalEntityDetails {
  id?: string;
  entityName?: string;
  entityCode?: string;
  entityType?: number;
  entityTypeName?: string;
  contactInfo?: string;
  status?: number;
  statusName?: string;
  createAt?: string; // ISO date string
  createBy?: string;
  lastUpdateAt?: string; // ISO date string
  lastUpdateBy?: string;
}

export interface IExternalEntityPayload {
  id?: string;
  entityName?: string;
  entityCode?: string;
  entityType?: number;
  contactInfo?: string;
  status?: number;
}

export interface IExternalEntityResponse {
  items: IExternalEntityList[];
  totalCount: number;
}

export interface IExternalEntityQuery {
  page: number;
  pageSize: number;
  searchText?: string;
  entityType?: string;
  status?: number;
}
