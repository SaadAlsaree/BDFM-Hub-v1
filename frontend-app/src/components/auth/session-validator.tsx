'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SessionValidatorProps {
  children: React.ReactNode;
}

export function SessionValidator({ children }: SessionValidatorProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Only check session if we're not on a public page
    const isPublicPage = ['/', '/login', '/signout', '/auth/error'].includes(
      window.location.pathname
    );

    if (!isPublicPage && status === 'unauthenticated') {
      console.warn('Session validation failed: User is not authenticated');
      router.push('/login');
    }

    if (status === 'authenticated' && session && !session.accessToken) {
      console.warn('Session validation failed: No access token found');
      router.push('/login');
    }
  }, [session, status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='border-primary h-32 w-32 animate-spin rounded-full border-b-2'></div>
      </div>
    );
  }

  return <>{children}</>;
}
