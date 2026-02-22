import { axiosInstance } from '@/lib/axios';
import {
  IDelayedStepsReportQuery,
  WorkflowStepsStatisticsQuery,
  WorkflowStepsStatisticsResponse
} from '../types/workflow-steps-statistics';

const baseUrl = process.env.API_URL || 'http://cm-back.inss.local:5000/BDFM/v1/api';

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
  },
  ///BDFM/v1/api/Workflow/DownloadDelayedStepsReport
  async downloadDelayedStepsReport(query?: IDelayedStepsReportQuery) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Workflow/DownloadDelayedStepsReport`,
        {
          params: query,
          responseType: 'blob'
        }
      );
      return response.data; // return file
    } catch (error) {
      console.error('Error getting workflow steps statistics by unit:', error);
      return null;
    }
  }
};
