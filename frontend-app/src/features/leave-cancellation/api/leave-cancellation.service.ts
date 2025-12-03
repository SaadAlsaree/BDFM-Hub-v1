import { axiosInstance } from '@/lib/axios';
import { IResponse } from '@/types/response';
import { LeaveCancellation } from '../types/leave-cancellation';

const baseUrl = process.env.API_URL || 'http://localhost:5000/BDFM/v1/api';

export const leaveCancellationService = {
  async getLeaveCancellationsByRequestId(requestId: string) {
    try {
      if (!requestId) {
        return null;
      }

      const response = await axiosInstance.get(
        `${baseUrl}/LeaveRequests/${requestId}/Cancellations`
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponse<LeaveCancellation[]>) || null;
    } catch (error) {
      return null;
    }
  }
};
