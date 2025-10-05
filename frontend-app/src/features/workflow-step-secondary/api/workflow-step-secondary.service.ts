import { axiosClient } from '@/lib/axios';
import { IResponse } from '@/types/response';
import { WorkflowStepSecondaryCreate, WorkflowStepSecondaryUpdate } from '../types/workflow-step-secondary';

const baseUrl = process.env.API_URL || 'http://localhost:5000/BDFM/v1/api';


export const workflowStepSecondaryService = {
    async createWorkflowStepSecondary(payload: WorkflowStepSecondaryCreate) {
        try {
            const response = await axiosClient.post(`${baseUrl}/WorkflowStepSecondary/CreateWorkflowStepSecondary`, payload);
            if (response.status >= 400) {
                // console.error('Error creating workflow step secondary:', response.statusText);
                return null;
            }
            return response.data as IResponse<WorkflowStepSecondaryCreate> || null;
        } catch (error) {
            // console.log(error);
            return null;
        }
    },

    async updateWorkflowStepSecondary(payload: WorkflowStepSecondaryUpdate) {
        try {
            const response = await axiosClient.put(`${baseUrl}/WorkflowStepSecondary/UpdateWorkflowStepSecondary`, payload);
            if (response.status >= 400) {
                // console.error('Error updating workflow step secondary:', response.statusText);
                return null;
            }
            return response.data as IResponse<WorkflowStepSecondaryUpdate> || null;
        } catch (error) {
            // console.log(error);
            return null;
        }
    },

    async deleteWorkflowStepSecondary(id: string) {
        try {
            const response = await axiosClient.delete(`${baseUrl}/WorkflowStepSecondary/DeleteWorkflowStepSecondary/${id}`);
            if (response.status >= 400) {
                // console.error('Error deleting workflow step secondary:', response.statusText);
                return null;
            }
            return response.data as IResponse<boolean> || null;
        } catch (error) {
            // console.log(error);
            return null;
        }
    }
};


