import { axiosInstance, axiosClient } from '@/lib/axios';
import { IResponseList, IResponse } from '@/types/response';
import { CustomWorkflowData, CustomWorkflowDetailData, CustomWorkflowUpsertDto, ICustomWorkflowQuery } from '../types/custom-workflow';
import { CustomWorkflowList } from '@/features/customWorkflow/types/customWorkflow';
const baseUrl = process.env.API_URL || 'http://localhost:5000/BDFM/v1/api';




export const customWorkflowService = {

    // 1-CustomWorkflows
    ///BDFM/v1/api/CustomWorkflows/GetCustomWorkflowList
    async getCustomWorkflows(query: ICustomWorkflowQuery) {
        try {
            const response = await axiosInstance.get(`${baseUrl}/CustomWorkflows/GetCustomWorkflowList`, { params: query });
            return response.data as IResponseList<CustomWorkflowData>;
        } catch (error) {
            console.error('Error fetching custom workflows:', error);
            throw error;
        }
    },

    async getCustomWorkflowListClient(query: Record<string, any>) {
        try {
            const response = await axiosClient.get(`${baseUrl}/CustomWorkflows/GetCustomWorkflowList`, { params: query });
            return response.data as IResponseList<CustomWorkflowList>;
        } catch (error) {
            console.error('Error fetching custom workflows:', error);
            throw error;
        }
    },

    ///BDFM/v1/api/CustomWorkflows/GetCustomWorkflowById/{id}
    async getCustomWorkflowById(id: string) {
        try {
            if (!id) {
                console.error('getCustomWorkflowById called without an ID');
                return null;
            }
            const response = await axiosInstance.get(`${baseUrl}/CustomWorkflows/GetCustomWorkflowById/${id}`);
            return response.data as IResponse<CustomWorkflowDetailData>;
        } catch (error) {
            console.error('Error fetching custom workflow by ID:', error);
            throw error;
        }
    },


    ///BDFM/v1/api/CustomWorkflows/CreateCustomWorkflow [POST]
    async createCustomWorkflow(payload: CustomWorkflowUpsertDto) {
        try {
            const response = await axiosClient.post(`${baseUrl}/CustomWorkflows/CreateCustomWorkflow`, payload);
            return response.data;
        } catch (error) {
            console.error('Error creating custom workflow:', error);
            throw error;
        }
    },

    ///BDFM/v1/api/CustomWorkflows/UpdateCustomWorkflow [PUT]
    async updateCustomWorkflow(payload: CustomWorkflowUpsertDto) {
        try {
            const response = await axiosClient.put(`${baseUrl}/CustomWorkflows/UpdateCustomWorkflow`, payload);
            return response.data;
        } catch (error) {
            console.error('Error updating custom workflow:', error);
            throw error;
        }
    },

    // /BDFM/v1/api/CustomWorkflows/DeleteCustomWorkflow/{id} [DELETE]
    async deleteCustomWorkflow(id: string) {
        try {
            if (!id) {
                console.error('deleteCustomWorkflow called without an ID');
                return null;
            }
            const response = await axiosClient.delete(`${baseUrl}/CustomWorkflows/DeleteCustomWorkflow/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting custom workflow:', error);
            throw error;
        }
    },

    // 2-CustomWorkflowSteps

    // /BDFM/v1/api/CustomWorkflowSteps/GetCustomWorkflowStepList
    async getCustomWorkflowSteps(query: ICustomWorkflowQuery) {
        try {
            const response = await axiosInstance.get(`${baseUrl}/CustomWorkflowSteps/GetCustomWorkflowStepList`, { params: query });
            return response.data;
        } catch (error) {
            console.error('Error fetching custom workflow steps:', error);
            throw error;
        }
    },


    ///BDFM/v1/api/CustomWorkflowSteps/GetCustomWorkflowStepById/{id}
    async getCustomWorkflowStepById(id: string) {
        try {
            if (!id) {
                console.error('getCustomWorkflowStepById called without an ID');
                return null;
            }
            const response = await axiosInstance.get(`${baseUrl}/CustomWorkflowSteps/GetCustomWorkflowStepById/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching custom workflow step by ID:', error);
            throw error;
        }
    },


    // /BDFM/v1/api/CustomWorkflowSteps/CreateCustomWorkflowStep [POST]
    async createCustomWorkflowStep(payload: CustomWorkflowUpsertDto) {
        try {
            const response = await axiosClient.post(`${baseUrl}/CustomWorkflowSteps/CreateCustomWorkflowStep`, payload);
            return response.data;
        } catch (error) {
            console.error('Error creating custom workflow step:', error);
            throw error;
        }
    },

    // /BDFM/v1/api/CustomWorkflowSteps/UpdateCustomWorkflowStep [PUT]
    async updateCustomWorkflowStep(payload: CustomWorkflowUpsertDto) {
        try {
            const response = await axiosClient.put(`${baseUrl}/CustomWorkflowSteps/UpdateCustomWorkflowStep`, payload);
            return response.data;
        } catch (error) {
            console.error('Error updating custom workflow step:', error);
            throw error;
        }
    },

    // /BDFM/v1/api/CustomWorkflowSteps/DeleteCustomWorkflowStep/{id} [DELETE]
    async deleteCustomWorkflowStep(id: string) {
        try {
            if (!id) {
                console.error('deleteCustomWorkflowStep called without an ID');
                return null;
            }
            const response = await axiosClient.delete(`${baseUrl}/CustomWorkflowSteps/DeleteCustomWorkflowStep/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting custom workflow step:', error);
            throw error;
        }
    },
}