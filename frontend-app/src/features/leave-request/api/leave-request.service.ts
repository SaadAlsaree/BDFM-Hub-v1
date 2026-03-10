import { axiosInstance, axiosClient } from '@/lib/axios';
import { IResponseList, IResponse } from '@/types/response';
import {
  LeaveRequest,
  LeaveRequestList,
  CreateLeaveRequestPayload,
  UpdateLeaveRequestPayload,
  ApproveLeaveRequestPayload,
  RejectLeaveRequestPayload,
  CancelLeaveRequestPayload,
  InterruptLeaveRequestPayload,
  GetAllLeaveRequestsQuery,
  GetLeaveRequestsByEmployeeIdQuery,
  GetLeaveRequestsByStatusQuery
} from '../types/leave-request';



export const leaveRequestService = {
  async getLeaveRequestById(id: string) {
    try {
      if (!id) {
        return null;
      }

      const response = await axiosInstance.get(
        `/LeaveRequests/GetLeaveRequestById/${id}`
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponse<LeaveRequest>) || null;
    } catch (error) {
      return null;
    }
  },

  async getAllLeaveRequests(query?: GetAllLeaveRequestsQuery) {
    try {
      const response = await axiosInstance.get(
        `/LeaveRequests/GetAllLeaveRequests`,
        { params: query }
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponseList<LeaveRequestList>) || null;
    } catch (error) {
      return null;
    }
  },

  async getLeaveRequestsByEmployeeId(
    employeeId: string,
    query?: GetLeaveRequestsByEmployeeIdQuery
  ) {
    try {
      if (!employeeId) {
        return null;
      }

      const response = await axiosInstance.get(
        `/LeaveRequests/GetLeaveRequestsByEmployeeId/ByEmployee/${employeeId}`,
        { params: query }
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponseList<LeaveRequestList>) || null;
    } catch (error) {
      return null;
    }
  },

  async getLeaveRequestsByStatus(
    status: number,
    query?: GetLeaveRequestsByStatusQuery
  ) {
    try {
      const response = await axiosInstance.get(
        `/LeaveRequests/GetLeaveRequestsByStatus/ByStatus/${status}`,
        { params: query }
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponseList<LeaveRequestList>) || null;
    } catch (error) {
      return null;
    }
  },

  async createLeaveRequest(payload: CreateLeaveRequestPayload) {
    try {
      const response = await axiosClient.post(
        `/LeaveRequests/CreateLeaveRequest`,
        payload
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponse<string>) || null;
    } catch (error) {
      return null;
    }
  },

  async updateLeaveRequest(payload: UpdateLeaveRequestPayload) {
    try {
      const response = await axiosClient.put(
        `/LeaveRequests/UpdateLeaveRequest`,
        payload
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      return null;
    }
  },

  async approveLeaveRequest(payload: ApproveLeaveRequestPayload) {
    try {
      const response = await axiosClient.post(
        `/LeaveRequests/ApproveLeaveRequest`,
        payload
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      return null;
    }
  },

  async rejectLeaveRequest(payload: RejectLeaveRequestPayload) {
    try {
      const response = await axiosClient.post(
        `/LeaveRequests/RejectLeaveRequest`,
        payload
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      return null;
    }
  },

  async cancelLeaveRequest(payload: CancelLeaveRequestPayload) {
    try {
      const response = await axiosClient.post(
        `/LeaveRequests/CancelLeaveRequest`,
        payload
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      return null;
    }
  },

  async interruptLeaveRequest(payload: InterruptLeaveRequestPayload) {
    try {
      const response = await axiosClient.post(
        `/LeaveRequests/InterruptLeaveRequest`,
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
