export interface IPermissionList {
  id?: string;
  name?: string;
  value?: string;
  description?: string;
  status?: number;
  userCount?: number;
  statusName?: string;
}

export interface IPermissionDetail {
  id?: string;
  name?: string;
  value?: string;
  description?: string;
  status?: number;
  statusName?: string;
}

export interface IPermissionPayload {
  id?: string;
  name?: string;
  value?: string;
  description?: string;
  statusId?: number;
}

export interface IPermissionQuery {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: number;
}

export interface IPermissionResponse {
  items?: IPermissionList[];
  totalCount?: number;
}
