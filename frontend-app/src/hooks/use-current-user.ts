// useCurrentUser.ts
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import { useAuthApi } from './use-auth-api';

export function useCurrentUser() {
  const queryClient = useQueryClient();
  const { authApiCall } = useAuthApi();

  const { data, error, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authApiCall(
        async () => await currentUserService.getCurrentUserClient()
      );
      return response;
    },
    staleTime: 1 * 60 * 1000, // 1 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true
  });

  const refreshUser = useMutation({
    mutationFn: () =>
      authApiCall(async () => await currentUserService.getCurrentUserClient()),
    onSuccess: (newData) => {
      queryClient.setQueryData(['currentUser'], newData);
    }
  });

  const clearUserCache = () => {
    currentUserService.clearCache();
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  };

  return {
    user: data?.data as UserDto | undefined,
    isLoading,
    error,
    refreshUser: refreshUser.mutate,
    clearUserCache
  };
}
