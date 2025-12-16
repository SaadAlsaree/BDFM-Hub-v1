import { axiosInstance } from '@/lib/axios';
import {
  WorkflowStepsStatisticsQuery,
  WorkflowStepsStatisticsResponse
} from '../types/workflow-steps-statistics';

const baseUrl = process.env.API_URL || 'http://localhost:5000/BDFM/v1/api';

export const workflowStepsStatisticsService = {
  ///BDFM/v1/api/Workflow/GetWorkflowStepsStatisticsByUnit
  async getWorkflowStepsStatisticsByUnit(query?: WorkflowStepsStatisticsQuery) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Workflow/GetWorkflowStepsStatisticsByUnit`,
        { params: query }
      );
      return response.data as WorkflowStepsStatisticsResponse;
    } catch (error) {
      console.error('Error getting workflow steps statistics by unit:', error);
      return null;
    }
  }
};
