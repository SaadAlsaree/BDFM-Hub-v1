export interface DelegationDto {
  id: string;
  delegatorUserId: string;
  delegateeUserId: string;
  permissionId: string;
  roleId: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  isActive: boolean;
}

export interface UserRoleDto {
  id: string;
  name: string;
  value: string;
  description: string;
  delegations: DelegationDto[];
}

export interface UserPermissionDto {
  id: string;
  name: string;
  value: string;
  description: string;
}

export interface OrganizationalUnitDto {
  id: string;
  unitName: string;
  unitCode: string;
  unitDescription: string;
  email: string;
  phoneNumber: string;
  address: string;
  postalCode: string;
  unitLogo: string;
  unitLevel: number;
  canReceiveExternalMail: boolean;
  canSendExternalMail: boolean;
}

export interface UserDto {
  id: string;
  username: string;
  userLogin: string;
  fullName: string;
  email: string;
  organizationalUnitId: string;
  positionTitle: string;
  rfidTagId: string;
  isActive: boolean;
  twoFactorSecret: string;
  lastLogin: string; // ISO string
  userRoles: UserRoleDto[];
  userPermissions: UserPermissionDto[];
  organizationalUnit: OrganizationalUnitDto;
}
