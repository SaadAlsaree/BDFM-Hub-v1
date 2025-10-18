export interface IRoleList {
  id?: string;
  name?: string;
  value?: string;
  description?: string;
  statusName?: string;
  statusId?: number;
  createdDate?: string;
  userCount?: number;
}

export interface RolePermissionDto {
  id: string;
  name: string;
  value: string;
  description: string;
}

export interface DelegationDto {
  delegatorUserId: string;
  delegatorUserName: string;
  delegateeUserId: string;
  delegateeUserName: string;
  permissionId: string;
  permissionName: string;
  roleId: string;
  roleValue: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface IRoleDetails {
  id: string;
  name: string;
  value: string;
  description: string;
  statusName: string;
  statusId: number;
  userCount: number;
  createdDate: string;
  lastModifiedDate: string;
  rolePermissions: RolePermissionDto[];
  delegations: DelegationDto[];
}

export interface IRolePayload {
  id?: string;
  name?: string;
  value?: string;
  description?: string;
  statusId?: number;
}

export interface IRoleQuery {
  page: number;
  pageSize: number;
  searchText?: string;
  status?: number;
}

export interface IRoleResponse {
  items: IRoleList[];
  totalCount: number;
}

export interface RolePermissionAssignmentDto {
  roleId: string;
  permissionIds: string[];
}
