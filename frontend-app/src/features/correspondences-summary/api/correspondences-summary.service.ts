import { axiosInstance } from "@/lib/axios";
import { UnitCorrespondenceSummaryQuery } from "../types/correspondences-summary";


const baseUrl = process.env.API_URL || 'http://cm-back.inss.local:5000/BDFM/v1/api';




export const correspondencesSummaryService = {

    //BDFM/v1/api/Correspondence/GetCorrespondencesSummaryByUnits
        async getCorrespondencesSummaryByUnits(query: UnitCorrespondenceSummaryQuery) {
        try {
            const response = await axiosInstance.get(
                `${baseUrl}/Correspondence/GetCorrespondencesSummaryByUnits`,
                { params: query }
            );
            return response;
        }
        catch (error) {
            console.error('Error getting correspondences summary:', error);
            return null;
        }
    }
}