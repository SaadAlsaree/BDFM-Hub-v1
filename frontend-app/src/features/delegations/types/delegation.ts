export interface IDelegationList {
  id: string;
  delegatorUserId: string;
  delegatorUserName: string;
  delegateeUserId: string;
  delegateeUserName: string;
  permissionId: string;
  permissionName: string;
  roleId: string;
  roleName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  statusId: number;
  statusName: string;
  createdDate: string;
}

export interface IDelegationDetail {
  id: string;
  delegatorUserId: string;
  delegatorUserName: string;
  delegateeUserId: string;
  delegateeUserName: string;
  permissionId: string;
  permissionName: string;
  roleId: string;
  roleName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  statusId: number;
  statusName: string;
  createdDate: string;
  lastModifiedDate: string;
}

export interface CreateDelegationPayload {
  id?: string;
  delegatorUserId?: string;
  delegateeUserId?: string;
  permissionId?: string;
  roleId?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface IDelegationQuery {
  page: number;
  pageSize: number;
  searchText?: string;
  status?: number;
  delegatorUserId?: string;
  permissionId?: string;
  roleId?: string;
  isActive?: boolean;
  fromDate?: string;
  toDate?: string;
}

export interface IDelegationResponse {
  items: IDelegationList[];
  totalCount: number;
}
