import { axiosInstance, axiosClient } from '@/lib/axios';
import { IResponse } from '@/types/response';
import {
  LeaveWorkflowStep,
  CreateLeaveWorkflowStepPayload,
  UpdateLeaveWorkflowStepStatusPayload,
  CompleteLeaveWorkflowStepPayload
} from '../types/leave-workflow-step';



export const leaveWorkflowStepService = {
  async getLeaveWorkflowStepById(id: string) {
    try {
      if (!id) {
        return null;
      }

      const response = await axiosInstance.get(
        `/LeaveWorkflowSteps/GetLeaveWorkflowStepById/${id}`
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponse<LeaveWorkflowStep>) || null;
    } catch (error) {
      return null;
    }
  },

  async getLeaveWorkflowStepsByRequestId(leaveRequestId: string) {
    try {
      if (!leaveRequestId) {
        return null;
      }

      const response = await axiosInstance.get(
        `/LeaveWorkflowSteps/GetLeaveWorkflowStepsByRequestId/ByRequestId/${leaveRequestId}`
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponse<LeaveWorkflowStep[]>) || null;
    } catch (error) {
      return null;
    }
  },

  async createLeaveWorkflowStep(payload: CreateLeaveWorkflowStepPayload) {
    try {
      const response = await axiosClient.post(
        `/LeaveWorkflowSteps/CreateLeaveWorkflowStep`,
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

  async updateLeaveWorkflowStepStatus(
    payload: UpdateLeaveWorkflowStepStatusPayload
  ) {
    try {
      const response = await axiosClient.put(
        `/LeaveWorkflowSteps/UpdateLeaveWorkflowStepStatus`,
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

  async completeLeaveWorkflowStep(payload: CompleteLeaveWorkflowStepPayload) {
    try {
      const response = await axiosClient.post(
        `/LeaveWorkflowSteps/CompleteLeaveWorkflowStep`,
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
