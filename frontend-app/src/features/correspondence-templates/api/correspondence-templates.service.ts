import { axiosInstance, axiosClient } from '@/lib/axios';
import {
  CorrespondenceTemplatesDetail,
  CorrespondenceTemplatesList,
  CorrespondenceTemplatesPayload
} from '../types/correspondence-templates';
import { IResponse, IResponseList } from '@/types/response';

const baseUrl =
  process.env.API_URL || 'http://cm-back.inss.local:5000/BDFM/v1/api';

export const correspondenceTemplatesService = {
  async getCorrespondenceTemplates(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/CorrespondenceTemplate/GetCorrespondenceTemplateList`,
        { params: query }
      );
      return (
        (response.data as IResponseList<CorrespondenceTemplatesList>) || null
      );
    } catch (error) {
      // console.error('Error fetching correspondence templates:', error);
      return null;
    }
  },

  /**
   * Get a correspondence template by ID
   */
  async getCorrespondenceTemplateById(id: string) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/CorrespondenceTemplate/GetCorrespondenceTemplateById/${id}`
      );
      return (
        (response.data as IResponse<CorrespondenceTemplatesDetail>) || null
      );
    } catch (error) {
      // console.error(`Error fetching correspondence template ${id}:`, error);
      return null;
    }
  },

  /**
   * Create a new correspondence template
   */
  async createCorrespondenceTemplate(payload: CorrespondenceTemplatesPayload) {
    try {
      const response = await axiosClient.post(
        `${baseUrl}/CorrespondenceTemplate/CreateCorrespondenceTemplate`,
        payload
      );
      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error('Error creating correspondence template:', error);
      return null;
    }
  },

  /**
   * Update an existing correspondence template
   */
  async updateCorrespondenceTemplate(
    id: string,
    payload: CorrespondenceTemplatesPayload
  ) {
    try {
      const response = await axiosClient.put(
        `${baseUrl}/CorrespondenceTemplate/UpdateCorrespondenceTemplate`,
        payload
      );
      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error(`Error updating correspondence template ${id}:`, error);
      return null;
    }
  },

  /**
   * Delete a correspondence template
   */
  async deleteCorrespondenceTemplate(id: string) {
    try {
      await axiosClient.delete(
        `${baseUrl}/CorrespondenceTemplate/DeleteCorrespondenceTemplate/${id}`
      );
      return true;
    } catch (error) {
      // console.error(`Error deleting correspondence template ${id}:`, error);
      return false;
    }
  },

  /**
   * Change the status of a correspondence template
   */
  async changeCorrespondenceTemplateStatus(id: string, status: number) {
    try {
      await axiosClient.patch(
        `${baseUrl}/CorrespondenceTemplate/ChangeStatus/ChangeStatus`,
        { status }
      );
      return true;
    } catch (error) {
      // console.error(`Error changing status for correspondence template ${id}:`, error);
      return false;
    }
  }
};
