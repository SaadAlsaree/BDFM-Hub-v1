import { axiosInstance } from '@/lib/axios';
import { InboxList } from '@/features/correspondence/types/register-incoming-external-mail';
import { IResponseList } from '@/types/response';

const baseUrl = process.env.API_URL || 'http://localhost:5000/BDFM/v1/api';

export const advancedSearchService = {
  // search correspondence /Correspondence/SearchCorrespondences
  async searchCorrespondences(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Correspondence/SearchCorrespondences`,
        { params: query }
      );
      return response.data as IResponseList<InboxList>;
    } catch (error) {
      // console.error('Error searching correspondences:', error);
      return null;
    }
  }
};
