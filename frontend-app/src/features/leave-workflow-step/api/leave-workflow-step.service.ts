import { axiosInstance, axiosClient } from '@/lib/axios';
import { IResponse } from '@/types/response';
import {
  LeaveWorkflowStep,
  CreateLeaveWorkflowStepPayload,
  UpdateLeaveWorkflowStepStatusPayload,
  CompleteLeaveWorkflowStepPayload
} from '../types/leave-workflow-step';

const baseUrl = process.env.API_URL || 'http://cm-back.inss.local:5000/BDFM/v1/api';

export const leaveWorkflowStepService = {
  async getLeaveWorkflowStepById(id: string) {
    try {
      if (!id) {
        return null;
      }

      const response = await axiosInstance.get(
        `${baseUrl}/LeaveWorkflowSteps/GetLeaveWorkflowStepById/${id}`
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
        `${baseUrl}/LeaveWorkflowSteps/GetLeaveWorkflowStepsByRequestId/ByRequestId/${leaveRequestId}`
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
        `${baseUrl}/LeaveWorkflowSteps/CreateLeaveWorkflowStep`,
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
        `${baseUrl}/LeaveWorkflowSteps/UpdateLeaveWorkflowStepStatus`,
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
        `${baseUrl}/LeaveWorkflowSteps/CompleteLeaveWorkflowStep`,
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

