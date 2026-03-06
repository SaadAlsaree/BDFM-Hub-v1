import { axiosClient, axiosInstance } from '@/lib/axios';
import { IResponseList, IResponse } from '@/types/response';
import {
  IDelegationList,
  IDelegationDetail,
  CreateDelegationPayload
} from '@/features/delegations/types/delegation';

const baseUrl = process.env.API_URL || 'http://localhost:5000/BDFM/v1/api';

export const delegationService = {
  async getDelegationList(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Delegation/GetDelegationList`,
        { params: query }
      );
      if (response.status >= 400) {
        // console.error('Error fetching roles:', response.statusText);
        return null;
      }
      return (response.data as IResponseList<IDelegationList>) || null;
    } catch (error) {
      // console.error('Error fetching delegations:', error);
      return null;
    }
  },

  async getDelegationDetail(id: string) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Delegation/GetDelegationById/${id}`
      );
      if (response.status >= 400) {
        // console.error(`Error fetching delegation ${id}:`, response.statusText);
        return null;
      }
      return (response.data as IResponse<IDelegationDetail>) || null;
    } catch (error) {
      // console.error(`Error fetching delegation ${id}:`, error);
      return null;
    }
  },

  async createDelegation(delegation: CreateDelegationPayload) {
    try {
      const response = await axiosClient.post(
        `${baseUrl}/Delegation/CreateDelegation`,
        delegation
      );
      if (response.status >= 400) {
        // console.error('Error creating delegation:', response.statusText);
        return null;
      }
      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error('Error creating delegation:', error);
      return null;
    }
  },

  async updateDelegation(delegation: CreateDelegationPayload) {
    try {
      const response = await axiosClient.put(
        `${baseUrl}/Delegation/UpdateDelegation`,
        delegation
      );
      if (response.status >= 400) {
        // console.error('Error updating delegation:', response.statusText);
        return null;
      }
      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error('Error updating delegation:', error);
      return null;
    }
  },

  async updateDelegationStatus(id: string, status: number) {
    try {
      const response = await axiosClient.patch(
        `${baseUrl}/Delegation/UpdateDelegationStatus`,
        { id, status }
      );
      if (response.status >= 400) {
        // console.error('Error updating delegation status:', response.statusText);
        return null;
      }
      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error('Error updating delegation status:', error);
      return null;
    }
  },

  async deleteDelegation(id: string) {
    try {
      const response = await axiosClient.delete(
        `${baseUrl}/Delegation/DeleteDelegation/${id}`
      );
      if (response.status >= 400) {
        //      console.error('Error deleting delegation:', response.statusText);
        return null;
      }
      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error('Error deleting delegation:', error);
      return null;
    }
  }
};
