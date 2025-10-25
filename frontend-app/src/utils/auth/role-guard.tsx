'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserDto } from './auth';
import {
  hasAnyRole,
  hasRole,
  hasPermission,
  hasAnyPermission,
  isAuthenticated
} from './auth-utils';

type RoleGuardProps = {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  roles?: string[];
  user: UserDto | null;
  permissions?: string[];
  requireAll?: boolean;
  loading?: boolean;
};

/**
 * RoleGuard component for protecting routes and components based on user roles and permissions
 * @param props - RoleGuard component props
 * @returns React component
 */
export function RoleGuard({
  children,
  fallback = null,
  redirectTo = '/unauthorized',
  roles = [],
  user,
  permissions = [],
  requireAll = false,
  loading = false
}: RoleGuardProps) {
  const router = useRouter();
  const [canAccess, setCanAccess] = useState<boolean>(false);

  useEffect(() => {
    // Allow access while loading
    if (loading) {
      setCanAccess(false);
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated(user)) {
      if (redirectTo) {
        router.push('/login');
      }
      setCanAccess(false);
      return;
    }

    // If no roles or permissions are specified, allow access
    if (roles.length === 0 && permissions.length === 0) {
      setCanAccess(true);
      return;
    }

    // Check roles and permissions
    let hasRequiredRoles = true;
    let hasRequiredPermissions = true;

    // Check roles if specified
    if (roles.length > 0) {
      hasRequiredRoles = requireAll
        ? roles.every((role) => hasRole(user, role))
        : hasAnyRole(user, roles);
    }

    // Check permissions if specified
    if (permissions.length > 0) {
      hasRequiredPermissions = requireAll
        ? permissions.every((permission) => hasPermission(user, permission))
        : hasAnyPermission(user, permissions);
    }

    const hasAccess = hasRequiredRoles && hasRequiredPermissions;

    if (!hasAccess && redirectTo) {
      router.push(redirectTo);
    }

    setCanAccess(hasAccess);
  }, [user, roles, permissions, requireAll, redirectTo, loading, router]);

  if (loading) {
    // Show loading state
    return (
      <div className='flex h-24 w-full items-center justify-center'>
        <div className='border-primary h-8 w-8 animate-spin rounded-full border-b-2' />
      </div>
    );
  }

  if (!canAccess) {
    return fallback;
  }

  return <>{children}</>;
}

/**
 * Higher-order component to wrap components with role-based access control
 * @param WrappedComponent - Component to wrap
 * @param options - Role guard options
 * @returns Wrapped component with role guard
 */
export function withRoleGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Omit<RoleGuardProps, 'children'>
) {
  return function WithRoleGuard(props: P) {
    return (
      <RoleGuard {...options}>
        <WrappedComponent {...props} />
      </RoleGuard>
    );
  };
}

/**
 * Hook to check if user has access based on roles and permissions
 * @param options - Access check options
 * @returns boolean indicating if user has access
 */
export function useHasAccess({
  user,
  roles = [],
  permissions = [],
  requireAll = false
}: {
  user: UserDto | null;
  roles?: string[];
  permissions?: string[];
  requireAll?: boolean;
}): boolean {
  if (!isAuthenticated(user)) {
    return false;
  }

  // If no roles or permissions are specified, allow access
  if (roles.length === 0 && permissions.length === 0) {
    return true;
  }

  // Check roles and permissions
  let hasRequiredRoles = true;
  let hasRequiredPermissions = true;

  // Check roles if specified
  if (roles.length > 0) {
    hasRequiredRoles = requireAll
      ? roles.every((role) => hasRole(user, role))
      : hasAnyRole(user, roles);
  }

  // Check permissions if specified
  if (permissions.length > 0) {
    hasRequiredPermissions = requireAll
      ? permissions.every((permission) => hasPermission(user, permission))
      : hasAnyPermission(user, permissions);
  }

  return hasRequiredRoles && hasRequiredPermissions;
}
