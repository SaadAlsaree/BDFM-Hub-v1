import { UserDto } from './auth';

/**
 * Check if the user has a specific role
 * @param user - The user to check
 * @param roleName - The role name or value to check
 * @returns boolean indicating if the user has the role
 */
export function hasRole(user: UserDto | null, roleName: string): boolean {
  if (!user || !user.userRoles?.length) {
    return false;
  }

  return user.userRoles.some(
    (role) => role.name === roleName || role.value === roleName
  );
}

/**
 * Check if the user has any of the specified roles
 * @param user - The user to check
 * @param roleNames - Array of role names or values
 * @returns boolean indicating if the user has any of the roles
 */
export function hasAnyRole(user: UserDto | null, roleNames: string[]): boolean {
  if (!user || !user.userRoles?.length || !roleNames.length) {
    return false;
  }

  return roleNames.some(role => hasRole(user, role));
}

/**
 * Check if the user has all of the specified roles
 * @param user - The user to check
 * @param roleNames - Array of role names or values
 * @returns boolean indicating if the user has all the roles
 */
export function hasAllRoles(user: UserDto | null, roleNames: string[]): boolean {
  if (!user || !user.userRoles?.length || !roleNames.length) {
    return false;
  }

  return roleNames.every(role => hasRole(user, role));
}

/**
 * Check if the user has a specific permission
 * @param user - The user to check
 * @param permissionValue - The permission value to check
 * @returns boolean indicating if the user has the permission
 */
export function hasPermission(user: UserDto | null, permissionValue: string): boolean {
  if (!user || !user.userPermissions?.length) {
    return false;
  }

  return user.userPermissions.some(
    (permission) =>
      permission.value === permissionValue || permission.name === permissionValue
  );
}

/**
 * Check if the user has any of the specified permissions
 * @param user - The user to check
 * @param permissionValues - Array of permission values
 * @returns boolean indicating if the user has any of the permissions
 */
export function hasAnyPermission(user: UserDto | null, permissionValues: string[]): boolean {
  if (!user || !user.userPermissions?.length || !permissionValues.length) {
    return false;
  }

  return permissionValues.some(permission => hasPermission(user, permission));
}

/**
 * Check if the user has all of the specified permissions
 * @param user - The user to check
 * @param permissionValues - Array of permission values
 * @returns boolean indicating if the user has all the permissions
 */
export function hasAllPermissions(user: UserDto | null, permissionValues: string[]): boolean {
  if (!user || !user.userPermissions?.length || !permissionValues.length) {
    return false;
  }

  return permissionValues.every(permission => hasPermission(user, permission));
}

/**
 * Get all role values for a user
 * @param user - The user to get roles for
 * @returns Array of role values
 */
export function getUserRoles(user: UserDto | null): string[] {
  if (!user || !user.userRoles?.length) {
    return [];
  }

  return user.userRoles.map(role => role.value);
}

/**
 * Get all permission values for a user
 * @param user - The user to get permissions for
 * @returns Array of permission values
 */
export function getUserPermissions(user: UserDto | null): string[] {
  if (!user || !user.userPermissions?.length) {
    return [];
  }

  const permissions = new Set<string>();

  user.userPermissions.forEach(permission => {
    permissions.add(permission.value);
  });

  return Array.from(permissions);
}

/**
 * Check if the user is authenticated (has a valid userId and is active)
 * @param user - The user to check
 * @returns boolean indicating if the user is authenticated
 */
export function isAuthenticated(user: UserDto | null): boolean {
  return !!user && !!user.id && user.isActive;
}

/**
 * Check if the user belongs to a specific organizational unit
 * @param user - The user to check
 * @param organizationalUnitId - The organizational unit ID
 * @returns boolean indicating if the user belongs to the organizational unit
 */
export function isInOrganizationalUnit(user: UserDto | null, organizationalUnitId: string): boolean {
  if (!user) {
    return false;
  }

  return user.organizationalUnitId === organizationalUnitId;
}
