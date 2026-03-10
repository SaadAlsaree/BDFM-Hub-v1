import { axiosClient, axiosInstance } from '@/lib/axios';
import {
  IDelayedStepsReportQuery,
  WorkflowStepsStatisticsQuery,
  WorkflowStepsStatisticsResponse
} from '../types/workflow-steps-statistics';



export const workflowStepsStatisticsService = {
  ///BDFM/v1/api/Workflow/GetWorkflowStepsStatisticsByUnit
  async getWorkflowStepsStatisticsByUnit(query?: WorkflowStepsStatisticsQuery) {
    try {
      const response = await axiosInstance.get(
        `/Workflow/GetWorkflowStepsStatisticsByUnit`,
        { params: query }
      );
      return response.data as WorkflowStepsStatisticsResponse;
    } catch (error) {
      // console.error('Error getting workflow steps statistics by unit:', error);
      return null;
    }
  },
  ///BDFM/v1/api/Workflow/DownloadDelayedStepsReport
  async downloadDelayedStepsReport(query?: IDelayedStepsReportQuery) {
    try {
      const response = await axiosClient.get(
        `/Workflow/DownloadDelayedStepsReport`,
        {
          params: query,
          responseType: 'blob'
        }
      );
      return response.data; // return file
    } catch (error) {
      // console.error('Error getting workflow steps statistics by unit:', error);
      return null;
    }
  }
};
