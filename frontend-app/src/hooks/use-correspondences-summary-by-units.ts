'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthApi } from './use-auth-api';
import { correspondencesSummaryService } from '@/features/correspondences-summary/api/correspondences-summary.service';
import { UnitCorrespondenceSummaryQuery, UnitCorrespondenceSummaryResponse } from '@/features/correspondences-summary/types/correspondences-summary';

export function useCorrespondencesSummaryByUnits(
  query?: UnitCorrespondenceSummaryQuery
) {
  const { authApiCall } = useAuthApi();

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['correspondencesSummaryByUnits', query],
    queryFn: async () => {
      const response = await authApiCall(
        async () =>
          await correspondencesSummaryService.getCorrespondencesSummaryByUnits(
            query || {}
          )
      );
      // The service returns axios response, so we need to access response.data
      return response?.data as UnitCorrespondenceSummaryResponse | undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true
  });

  return {
    data,
    error,
    isLoading,
    refetch
  };
}

