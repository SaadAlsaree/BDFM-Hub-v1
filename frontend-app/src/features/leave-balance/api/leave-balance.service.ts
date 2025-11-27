import { axiosInstance, axiosClient } from '@/lib/axios';
import { IResponseList, IResponse } from '@/types/response';
import {
  LeaveBalance,
  LeaveBalanceHistory,
  GetLeaveBalanceHistoryQuery,
  SyncLeaveBalancePayload
} from '../types/leave-balance';

const baseUrl = process.env.API_URL || 'http://cm-back.inss.local:5000/BDFM/v1/api';

export const leaveBalanceService = {
  async getLeaveBalanceByEmployeeId(
    employeeId: string,
    leaveType?: number
  ) {
    try {
      if (!employeeId) {
        return null;
      }

      const params: Record<string, any> = {};
      if (leaveType) {
        params.leaveType = leaveType;
      }

      const response = await axiosInstance.get(
        `${baseUrl}/LeaveBalances/GetLeaveBalanceByEmployeeId/ByEmployee/${employeeId}`,
        { params }
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponse<LeaveBalance[]>) || null;
    } catch (error) {
      return null;
    }
  },

  async getLeaveBalanceHistory(query?: GetLeaveBalanceHistoryQuery) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/LeaveBalances/GetLeaveBalanceHistory/History`,
        { params: query }
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponseList<LeaveBalanceHistory>) || null;
    } catch (error) {
      return null;
    }
  },

  async syncLeaveBalance(payload: SyncLeaveBalancePayload) {
    try {
      const response = await axiosClient.post(
        `${baseUrl}/LeaveBalances/SyncLeaveBalance`,
        payload
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      return null;
    }
  }
};

