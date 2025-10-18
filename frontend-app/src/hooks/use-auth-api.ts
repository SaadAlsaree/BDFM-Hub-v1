import { useSession } from 'next-auth/react';
import { useCallback } from 'react';
import { setAuthToken } from '@/lib/axios';

/**
 * A custom hook that provides an authenticated API call function
 * This hook handles setting the auth token before the API call and clearing it afterward
 */
export function useAuthApi() {
  const { data: session } = useSession();

  const authApiCall = useCallback(
    async <T>(apiFunction: () => Promise<T>): Promise<T> => {
      try {
        // Set the auth token if available
        if (session?.accessToken) {
          setAuthToken(session.accessToken);
        }

        // Execute the API function
        return await apiFunction();
      } finally {
        // Always clear the token after the request
        setAuthToken(null);
      }
    },
    [session]
  );

  return { authApiCall };
}
