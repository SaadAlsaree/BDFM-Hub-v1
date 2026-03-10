import { axiosInstance, axiosClient } from '@/lib/axios';
import { IResponseList, IResponse } from '@/types/response';
import {
  LeaveWorkflow,
  LeaveWorkflowList,
  CreateLeaveWorkflowPayload,
  UpdateLeaveWorkflowPayload,
  GetLeaveWorkflowListQuery
} from '../types/leave-workflow';



export const leaveWorkflowService = {
  async getLeaveWorkflowList(query?: GetLeaveWorkflowListQuery) {
    try {
      const response = await axiosInstance.get(
        `/LeaveWorkflows/GetLeaveWorkflowList`,
        { params: query }
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponseList<LeaveWorkflowList>) || null;
    } catch (error) {
      return null;
    }
  },

  async getLeaveWorkflowById(id: string) {
    try {
      if (!id) {
        return null;
      }

      const response = await axiosInstance.get(
        `/LeaveWorkflows/GetLeaveWorkflowById/${id}`
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponse<LeaveWorkflow>) || null;
    } catch (error) {
      return null;
    }
  },

  async createLeaveWorkflow(payload: CreateLeaveWorkflowPayload) {
    try {
      const response = await axiosClient.post(
        `/LeaveWorkflows/CreateLeaveWorkflow`,
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

  async updateLeaveWorkflow(payload: UpdateLeaveWorkflowPayload) {
    try {
      const response = await axiosClient.put(
        `/LeaveWorkflows/UpdateLeaveWorkflow`,
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

  async deleteLeaveWorkflow(id: string) {
    try {
      if (!id) {
        return null;
      }

      const response = await axiosClient.delete(
        `/LeaveWorkflows/DeleteLeaveWorkflow/${id}`
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
