'use client';
import { useQuery } from '@tanstack/react-query';
import { useAuthApi } from './use-auth-api';
import { organizationalService } from '@/features/organizational-unit/api/organizational.service';

export function useSearchUnit(searchParams: Record<string, any>) {
    const { authApiCall } = useAuthApi();

    const { data, error, isLoading } = useQuery({
        queryKey: ['searchUnit', searchParams],
        queryFn: async () => {
            const response = await authApiCall(async () =>
                await organizationalService.searchOrganizationalUnitsClient(searchParams));
            return response;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    });
    return {
        data,
        error,
        isLoading
    };
}   