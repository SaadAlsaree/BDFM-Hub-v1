import { axiosInstance } from '@/lib/axios';
import { IResponseList } from '@/types/response';
import { ForwardedCorrespondenceItem } from '../types/forwarded-correspondence';

const baseUrl = process.env.API_URL || 'http://cm-back.inss.local:5000/BDFM/v1/api';

export const forwardedCorrespondenceService = {
  //Correspondence/GetForwardedCorrespondence
  async getForwardedCorrespondence(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Correspondence/GetForwardedCorrespondence`,
        { params: query }
      );
      return response.data as IResponseList<ForwardedCorrespondenceItem>;
    } catch (error) {
      console.error('Error fetching forwarded correspondence:', error);
      return null;
    }
  }
};
