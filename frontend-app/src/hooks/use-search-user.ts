'use client';
import { useQuery } from '@tanstack/react-query';
import { useAuthApi } from './use-auth-api';
import { userService } from '@/features/users/api/user.service';

export function useSearchUser(searchParams: Record<string, any>) {
  const { authApiCall } = useAuthApi();
  const { data, error, isLoading } = useQuery({
    queryKey: ['searchUser', searchParams],
    queryFn: async () => {
      const response = await authApiCall(
        async () => await userService.searchUserClient(searchParams)
      );
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true
  });
  return {
    data,
    error,
    isLoading
  };
}
