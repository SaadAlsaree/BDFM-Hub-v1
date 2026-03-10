import { axiosInstance, axiosClient } from '@/lib/axios';
import { IResponse } from '@/types/response';
import {
  LeaveWorkflowStepTemplate,
  CreateLeaveWorkflowStepTemplatePayload,
  UpdateLeaveWorkflowStepTemplatePayload
} from '../types/leave-workflow-step-template';



export const leaveWorkflowStepTemplateService = {
  async getLeaveWorkflowStepTemplateById(id: string) {
    try {
      if (!id) {
        return null;
      }

      const response = await axiosInstance.get(
        `/LeaveWorkflowStepTemplates/GetLeaveWorkflowStepTemplateById/${id}`
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponse<LeaveWorkflowStepTemplate>) || null;
    } catch (error) {
      return null;
    }
  },

  async getLeaveWorkflowStepTemplatesByWorkflowId(workflowId: string) {
    try {
      if (!workflowId) {
        return null;
      }

      const response = await axiosInstance.get(
        `/LeaveWorkflowStepTemplates/GetLeaveWorkflowStepTemplatesByWorkflowId/ByWorkflowId/${workflowId}`
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponse<LeaveWorkflowStepTemplate[]>) || null;
    } catch (error) {
      return null;
    }
  },

  async createLeaveWorkflowStepTemplate(
    payload: CreateLeaveWorkflowStepTemplatePayload
  ) {
    try {
      const response = await axiosClient.post(
        `/LeaveWorkflowStepTemplates/CreateLeaveWorkflowStepTemplate`,
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

  async updateLeaveWorkflowStepTemplate(
    payload: UpdateLeaveWorkflowStepTemplatePayload
  ) {
    try {
      const response = await axiosClient.put(
        `/LeaveWorkflowStepTemplates/UpdateLeaveWorkflowStepTemplate`,
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

  async deleteLeaveWorkflowStepTemplate(id: string) {
    try {
      if (!id) {
        return null;
      }

      const response = await axiosClient.delete(
        `/LeaveWorkflowStepTemplates/DeleteLeaveWorkflowStepTemplate/${id}`
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
