import { axiosInstance, axiosClient } from '@/lib/axios';
import { IResponse } from '@/types/response';
import { UserDto } from './auth';

const baseUrl = process.env.API_URL || 'http://localhost:5000/BDFM/v1/api';

class CurrentUserService {
  async getCurrentUser() {
    try {
      const response = await axiosInstance.get(`${baseUrl}/User/GetMe`);
      if (response.status === 400) {
        return null;
      }

      return (response.data as IResponse<UserDto>) || null;
    } catch (error) {
      throw null;
    }
  }

  clearCache() {
    // No-op: cache removed
  }

  async getCurrentUserClient() {
    const response = await axiosClient.get(`${baseUrl}/User/GetMe`);

    return (response.data as IResponse<UserDto>) || null;
  }
}

export const currentUserService: CurrentUserService = new CurrentUserService();
