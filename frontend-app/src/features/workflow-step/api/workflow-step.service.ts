import { axiosClient } from '@/lib/axios';
import { IResponse } from '@/types/response';
import {
  WorkflowStepInput,
  LogRecipientInternalActionInput,
  UpdateStatusInput,
  WorkflowStepBulkInsert
} from '../types/workflow-step';

const baseUrl = process.env.API_URL || 'http://cm-back.inss.local:5000/BDFM/v1/api';

export const workflowStepService = {
  ///Workflow/CreateWorkflowStep
  async createWorkflowStep(payload: WorkflowStepInput) {
    try {
      // console.log(JSON.stringify(payload));
      const response = await axiosClient.post(
        `${baseUrl}/Workflow/CreateWorkflowStep`,
        payload
      );
      if (response.status >= 400) {
        // console.error('Error creating role:', response.statusText);
        return null;
      }
      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.log(error);
      return null;
    }
  },

  // /Workflow/LogRecipientInternalAction
  async logRecipientInternalAction(payload: LogRecipientInternalActionInput) {
    try {
      const response = await axiosClient.post(
        `${baseUrl}/Workflow/LogRecipientInternalAction`,
        payload
      );
      if (response.status >= 400) {
        // console.error('Error creating role:', response.statusText);
        return null;
      }
      return (
        (response.data as IResponse<LogRecipientInternalActionInput>) || null
      );
    } catch (error) {
      // console.log(error);
      return null;
    }
  },

  // /Workflow/UpdateStatus/UpdateStatus
  async updateStatus(payload: UpdateStatusInput) {
    try {
      const response = await axiosClient.patch(
        `${baseUrl}/Workflow/UpdateStatus/UpdateStatus`,
        payload
      );
      if (response.status >= 400) {
        // console.error('Error creating role:', response.statusText);
        return null;
      }
      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.log(error);
      return null;
    }
  },

  // /Workflow/CompleteWorkflowStep/id
  async completeWorkflowStep(id: string) {
    try {
      const response = await axiosClient.put(
        `${baseUrl}/Workflow/CompleteWorkflowStep/id/${id}`
      );
      if (response.status >= 400) {
        // console.error('Error creating role:', response.statusText);
        return null;
      }
      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.log(error);
      return null;
    }
  },

  // /BDFM/v1/api/Workflow/CreateBulkWorkflowSteps
  async createBulkWorkflowSteps(payload: WorkflowStepBulkInsert) {
    try {
      const response = await axiosClient.post(
        `${baseUrl}/Workflow/CreateBulkWorkflowSteps`,
        payload
      );
      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      return null;
    }
  }
};
