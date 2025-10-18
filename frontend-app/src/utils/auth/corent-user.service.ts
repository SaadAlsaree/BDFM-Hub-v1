import { axiosInstance, axiosClient } from '@/lib/axios';
import { IResponse } from '@/types/response';
import { UserDto } from './auth';

const baseUrl = process.env.API_URL || 'http://cm-back.inss.local:5000/BDFM/v1/api';

class CurrentUserService {
  private cache: {
    user: IResponse<UserDto> | null;
    timestamp: number;
  } | null = null;

  private readonly CACHE_TTL = 1 * 60 * 1000; // 1 minutes in milliseconds

  async getCurrentUser(skipCache = false) {
    // Return from cache if it exists and hasn't expired
    if (
      !skipCache &&
      this.cache &&
      Date.now() - this.cache.timestamp < this.CACHE_TTL
    ) {
      return this.cache.user;
    }

    // Fetch fresh data
    try {
      const response = await axiosInstance.get(`${baseUrl}/User/GetMe`);
      if (response.status === 400) {
        this.cache = null;
        return null;
      }

      const userData = (response.data as IResponse<UserDto>) || null;

      // Update cache
      this.cache = {
        user: userData,
        timestamp: Date.now()
      };

      return userData;
    } catch (error) {
      this.cache = null;
      throw null;
    }
  }

  clearCache() {
    this.cache = null;
  }

  async getCurrentUserClient() {
    const response = await axiosClient.get(`${baseUrl}/User/GetMe`);

    return (response.data as IResponse<UserDto>) || null;
  }
}

export const currentUserService: CurrentUserService = new CurrentUserService();
