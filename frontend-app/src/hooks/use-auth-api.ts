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
        // Check if session exists and has valid token
        if (!session) {
          throw new Error('No active session found. Please log in again.');
        }

        if (!session.accessToken) {
          throw new Error('No access token found. Please log in again.');
        }

        // Set the auth token
        setAuthToken(session.accessToken);

        // Execute the API function
        return await apiFunction();
      } catch (error: any) {
        // Log authentication errors for debugging
        if (
          error?.message?.includes('401') ||
          error?.message?.includes('403')
        ) {
          // Use a more appropriate logging method for production
          if (process.env.NODE_ENV === 'development') {
            console.warn('Authentication error:', error.message);
          }
        }
        throw error;
      } finally {
        // Always clear the token after the request
        setAuthToken(null);
      }
    },
    [session]
  );

  return { authApiCall };
}
