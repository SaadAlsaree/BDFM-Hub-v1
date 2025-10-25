'use client';
import { useQuery } from '@tanstack/react-query';
import { useAuthApi } from './use-auth-api';
import { customWorkflowService } from '@/features/customWorkflow/api/customWorkflow.service';

export function useSearchCustomWorkflow(searchParams: Record<string, any>) {
  const { authApiCall } = useAuthApi();

  const { data, error, isLoading } = useQuery({
    queryKey: ['searchCustomWorkflow', searchParams],
    queryFn: async () => {
      const response = await authApiCall(
        async () =>
          await customWorkflowService.getCustomWorkflowListClient(searchParams)
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
