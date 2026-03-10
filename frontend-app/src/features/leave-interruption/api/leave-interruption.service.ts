import { axiosInstance } from '@/lib/axios';
import { IResponse } from '@/types/response';
import { LeaveInterruption } from '../types/leave-interruption';



export const leaveInterruptionService = {
  async getLeaveInterruptionsByRequestId(requestId: string) {
    try {
      if (!requestId) {
        return null;
      }

      const response = await axiosInstance.get(
        `/LeaveRequests/${requestId}/Interruptions`
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
