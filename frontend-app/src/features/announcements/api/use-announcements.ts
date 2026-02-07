'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthApi } from '@/hooks/use-auth-api';
import { announcementsService } from './announcements.service';
import { IAnnouncementListQuery } from '../types/announcements';


export function useActiveAnnouncements(query: IAnnouncementListQuery = {}) {
  const { authApiCall } = useAuthApi();

  return useQuery({
    queryKey: ['announcements', 'active', query],
    queryFn: async () => {
      return await authApiCall(
        async () => await announcementsService.getActiveAnnouncements(query)
      );
    },
    staleTime: 60 * 1000
  });
}

