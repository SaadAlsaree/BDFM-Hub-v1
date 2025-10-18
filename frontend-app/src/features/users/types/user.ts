export interface UserRole {
  id?: string;
  name?: string;
  value?: string;
  description?: string;
}

export interface EmployeeProfile {
  id: string;
  fullName: string;
  jobCode: string;
  status: number;
  positionTitle?: string;
  email?: string;
  phone?: string;
}

export interface UserDetailed {
  id: string;
  username: string;
  userLogin: string;
  fullName: string;
  email: string;
  organizationalUnitId: string;
  organizationalUnitName: string;
  positionTitle: string;
  rfidTagId: string;
  isActive: boolean;
  createAt: string; // ISO 8601 date string
  status: number;
  statusName: string;
  userRoles: UserRole[];
  userPermissions: IUserPermissionResponse[];
}

export interface IUserList {
  id: string;
  username: string;
  userLogin: string;
  fullName: string;
  email: string;
  organizationalUnitId: string;
  organizationalUnitName: string;
  positionTitle: string;
  isActive: boolean;
  createAt: string; // ISO date string (e.g., "2025-05-16T19:00:37.802Z")
  status: number;
  statusName: string;
}

export interface IUserQuery {
  page: number;
  pageSize: number;
  username: string;
  status: number;
}

export interface IUserResponse {
  items: IUserList[];
  totalCount: number;
}

export interface IUserRoleResponse {
  items: UserRole[];
  totalCount: number;
}

export interface UserPayloadDto {
  id?: string;
  username?: string;
  userLogin?: string;
  password?: string;
  fullName?: string;
  email?: string;
  organizationalUnitId?: string;
  positionTitle?: string;
  rfidTagId?: string;
  isActive?: boolean;
  roleIds?: string[];
}

export interface ChangePasswordRequest {
  id: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ResetPasswordRequest {
  userId: string;
  newPassword: string;
  confirmNewPassword?: string;
}

export interface AssignUserRolesDto {
  userId: string;
  roleIds: string[];
}

export interface CreateUserRoleDto {
  userId: string;
  roleId: string;
}

export interface ChangeStatus {
  id: string;
  statusId: number;
  tableName: number;
  teamId: string;
  teamName: string;
}

export interface AssignUserPermissionsDto {
  userId: string;
  permissionIds: string[];
}

export interface CreateUserPermissionDto {
  userId: string;
  permissionId: string;
}

export interface IUserPermissionResponse {
  id: string;
  name: string;
  value: string;
  description: string;
  statusName: string;
  statusId: number;
  createdDate: string; // ISO date string
  lastModifiedDate: string; // ISO date string
}

export interface RemoveUserPermissionDto {
  userId: string;
  permissionId: string;
}
