/* eslint-disable @typescript-eslint/no-explicit-any */
import { axiosInstance } from '@/lib/axios';
import { IResponse } from '@/types/response';
import { UserDto } from './auth/auth';

const baseUrl = 'http://cm-back.inss.local:5000/BDFM/v1/api';

class UtilizesService {
  public async getTypeOfService(params: { searchTerm?: string }): Promise<any> {
    try {
      const data = await axiosInstance.get<any>(`${baseUrl}/User/SearchUser`, {
        params
      });
      return data.data as IResponse<UserDto>;
    } catch (error) {
      return null;
    }
  }
}

export const utilizesService: UtilizesService = new UtilizesService();
