import { axiosInstance } from '@/lib/axios';
import { IResponseList } from '@/types/response';
import { ForwardedCorrespondenceItem } from '../types/forwarded-correspondence';



export const forwardedCorrespondenceService = {
  //Correspondence/GetForwardedCorrespondence
  async getForwardedCorrespondence(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `/Correspondence/GetForwardedCorrespondence`,
        { params: query }
      );
      return response.data as IResponseList<ForwardedCorrespondenceItem>;
    } catch (error) {
      // console.error('Error fetching forwarded correspondence:', error);
      return null;
    }
  }
};
