import { axiosInstance } from '@/lib/axios';
import { UnitCorrespondenceSummaryQuery } from '../types/correspondences-summary';

export const correspondencesSummaryService = {
  // BDFM/v1/api/Correspondence/GetCorrespondencesSummaryByUnits
  async getCorrespondencesSummaryByUnits(
    query: UnitCorrespondenceSummaryQuery
  ) {
    try {
      const response = await axiosInstance.get(
        '/Correspondence/GetCorrespondencesSummaryByUnits',
        { params: query }
      );
      return response;
    } catch (error) {
      // console.error('Error getting correspondences summary:', error);
      return null;
    }
  }
};
