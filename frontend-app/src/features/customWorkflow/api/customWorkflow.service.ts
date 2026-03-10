import { axiosClient, axiosInstance } from '@/lib/axios';
import { IResponseList, IResponse } from '@/types/response';
import {
  CustomWorkflowList,
  CustomWorkflowDetails,
  CreateWorkflowPayload,
  CreateWorkflowStepPayload,
  CustomWorkflowStepList,
  CustomWorkflowStepDetails
} from '../types/customWorkflow';



export const customWorkflowService = {
  ///CustomWorkflows/GetCustomWorkflowList
  async getCustomWorkflowList(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `/CustomWorkflows/GetCustomWorkflowList`,
        { params: query }
      );
      return response.data as IResponseList<CustomWorkflowList>;
    } catch (error) {
      // console.error('Error getting custom workflow list:', error);
      return null;
    }
  },

  ///CustomWorkflows/GetCustomWorkflowList client
  async getCustomWorkflowListClient(query: Record<string, any>) {
    try {
      const response = await axiosClient.get(
        `/CustomWorkflows/GetCustomWorkflowList`,
        { params: query }
      );
      return response.data as IResponseList<CustomWorkflowList>;
    } catch (error) {
      // console.error('Error getting custom workflow list:', error);
      return null;
    }
  },

  ///CustomWorkflows/GetCustomWorkflowById/{id}
  async getCustomWorkflowById(id: string) {
    try {
      const response = await axiosInstance.get(
        `/CustomWorkflows/GetCustomWorkflowById/${id}`
      );
      return response.data as IResponse<CustomWorkflowDetails>;
    } catch (error) {
      // console.error('Error getting custom workflow by id:', error);
      return null;
    }
  },

  //CustomWorkflows/CreateCustomWorkflow
  async createCustomWorkflow(payload: CreateWorkflowPayload) {
    try {
      const response = await axiosClient.post(
        `/CustomWorkflows/CreateCustomWorkflow`,
        payload
      );
      return response.data as IResponse<CustomWorkflowDetails>;
    } catch (error) {
      // console.error('Error creating custom workflow:', error);
      return null;
    }
  },

  //CustomWorkflows/UpdateCustomWorkflow
  async updateCustomWorkflow(payload: CreateWorkflowPayload) {
    try {
      const response = await axiosClient.put(
        `/CustomWorkflows/UpdateCustomWorkflow`,
        payload
      );
      return response.data as IResponse<CustomWorkflowDetails>;
    } catch (error) {
      // console.error('Error updating custom workflow:', error);
      return null;
    }
  },

  ///CustomWorkflows/DeleteCustomWorkflow/{id}
  async deleteCustomWorkflow(id: string) {
    try {
      const response = await axiosClient.delete(
        `/CustomWorkflows/DeleteCustomWorkflow/${id}`
      );
      return response.data as IResponse<boolean>;
    } catch (error) {
      // console.error('Error deleting custom workflow:', error);
      return null;
    }
  },

  //

  ///CustomWorkflowSteps/GetCustomWorkflowStepList
  async getCustomWorkflowStepList(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `/CustomWorkflowSteps/GetCustomWorkflowStepList`,
        { params: query }
      );
      return response.data as IResponseList<CustomWorkflowStepList>;
    } catch (error) {
      // console.error('Error getting custom workflow step list:', error);
      return null;
    }
  },

  ///CustomWorkflowSteps/GetCustomWorkflowStepById/{id}
  async getCustomWorkflowStepById(id: string) {
    try {
      const response = await axiosInstance.get(
        `/CustomWorkflowSteps/GetCustomWorkflowStepById/${id}`
      );
      return response.data as IResponse<CustomWorkflowStepDetails>;
    } catch (error) {
      // console.error('Error getting custom workflow step by id:', error);
      return null;
    }
  },

  ///CustomWorkflowSteps/CreateCustomWorkflowStep
  async createCustomWorkflowStep(payload: CreateWorkflowStepPayload) {
    try {
      const response = await axiosClient.post(
        `/CustomWorkflowSteps/CreateCustomWorkflowStep`,
        payload
      );
      return response.data as IResponse<CustomWorkflowStepDetails>;
    } catch (error) {
      // console.error('Error creating custom workflow step:', error);
      return null;
    }
  },

  //CustomWorkflowSteps/UpdateCustomWorkflowStep
  async updateCustomWorkflowStep(payload: CreateWorkflowStepPayload) {
    try {
      const response = await axiosClient.put(
        `/CustomWorkflowSteps/UpdateCustomWorkflowStep`,
        payload
      );
      return response.data as IResponse<CustomWorkflowStepDetails>;
    } catch (error) {
      // console.error('Error updating custom workflow step:', error);
      return null;
    }
  },

  //CustomWorkflowSteps/DeleteCustomWorkflowStep/{id}
  async deleteCustomWorkflowStep(id: string) {
    try {
      const response = await axiosClient.delete(
        `/CustomWorkflowSteps/DeleteCustomWorkflowStep/${id}`
      );
      return response.data as IResponse<boolean>;
    } catch (error) {
      // console.error('Error deleting custom workflow step:', error);
      return null;
    }
  }
};
