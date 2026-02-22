import { axiosInstance } from '@/lib/axios';
import { IResponse } from '@/types/response';
import { LeaveInterruption } from '../types/leave-interruption';

const baseUrl = process.env.API_URL || 'http://cm-back.inss.local:5000/BDFM/v1/api';

export const leaveInterruptionService = {
  async getLeaveInterruptionsByRequestId(requestId: string) {
    try {
      if (!requestId) {
        return null;
      }

      const response = await axiosInstance.get(
        `${baseUrl}/LeaveRequests/${requestId}/Interruptions`
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponse<LeaveInterruption[]>) || null;
    } catch (error) {
      return null;
    }
  }
};
