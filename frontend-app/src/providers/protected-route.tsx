'use client';

import { getRolesFromToken } from '@/lib/jwt-utils';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import Unauthorized from '@/components/auth/unauthorized';

interface ProtectedPageProps {
  children: ReactNode;
  requiredRole?: string;
}

export default function ProtectedPage({
  children,
  requiredRole
}: ProtectedPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hasRequiredRole, setHasRequiredRole] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    // Check for required role if specified
    if (requiredRole && session.accessToken) {
      const roles = getRolesFromToken(session.accessToken);
      setHasRequiredRole(roles.includes(requiredRole));
    }
  }, [session, status, router, requiredRole]);

  if (status === 'loading') {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-500'></div>
          <p className='mt-4 text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return null;
  }

  // Check for role authorization
  if (requiredRole && !hasRequiredRole) {
    return (
      <Unauthorized
        message={`ليس لديك صلاحية "${requiredRole}" للوصول إلى هذه الصفحة.`}
      />
    );
  }

  // Authenticated and authorized
  return <>{children}</>;
}
