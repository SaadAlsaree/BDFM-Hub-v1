'use client';
import { useQuery } from '@tanstack/react-query';
import { useAuthApi } from './use-auth-api';
import { correspondenceService } from '@/features/correspondence/api/correspondence.service';
import { CorrespondencesSummary } from '@/features/correspondence/types/correspondences-summary';

export function useCorrespondencesSummary(searchParams?: Record<string, any>) {
  const { authApiCall } = useAuthApi();

  const { data, error, isLoading } = useQuery({
    queryKey: ['correspondencesSummary', searchParams],
    queryFn: async () => {
      const response = await authApiCall(
        async () =>
          await correspondenceService.getCorrespondencesSummaryClient(
            searchParams
          )
      );
      return response.data as CorrespondencesSummary;
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
