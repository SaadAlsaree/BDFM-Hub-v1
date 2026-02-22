import { axiosInstance, axiosClient } from '@/lib/axios';
import { IResponseList, IResponse } from '@/types/response';
import {
  IExternalEntityResponse,
  IExternalEntityDetails,
  IExternalEntityPayload,
  IExternalEntityQuery
} from '@/features/external-entities/types/external-entities';

const baseUrl = process.env.API_URL || 'http://cm-back.inss.local:5000/BDFM/v1/api';

export const externalEntitiesService = {
  async getExternalEntities(query: IExternalEntityQuery) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/ExternalEntity/GetExternalEntityList`,
        { params: query }
      );
      return response.data as IResponseList<IExternalEntityResponse>;
    } catch (error: any) {
      // Error is already handled by axios interceptor for server-side
      // For client-side, we still want to handle gracefully
      if (typeof window !== 'undefined') {
        // console.warn('External entities service unavailable on client-side');
        return {
          succeeded: false,
          data: { items: [], totalCount: 0 },
          message: 'Service temporarily unavailable',
          errors: ['Service connection failed'],
          code: 'SERVICE_UNAVAILABLE'
        } as IResponseList<IExternalEntityResponse>;
      }
      throw error; // Let server-side errors bubble up if interceptor didn't handle them
    }
  },

  async getExternalEntityById(id: string) {
    if (!id) {
      // console.warn('getExternalEntityById called without an ID');
      return {
        succeeded: false,
        data: undefined,
        message: 'Invalid ID provided',
        errors: ['ID is required'],
        code: 'INVALID_INPUT'
      } as IResponse<IExternalEntityDetails>;
    }

    try {
      const response = await axiosInstance.get(
        `${baseUrl}/ExternalEntity/GetExternalEntityById/${id}`
      );
      return response.data as IResponse<IExternalEntityDetails>;
    } catch (error: any) {
      if (typeof window !== 'undefined') {
        // console.warn(`External entity ${id} service unavailable on client-side`);
        return {
          succeeded: false,
          data: undefined,
          message: 'Service temporarily unavailable',
          errors: ['Service connection failed'],
          code: 'SERVICE_UNAVAILABLE'
        } as IResponse<IExternalEntityDetails>;
      }
      throw error;
    }
  },

  async createExternalEntity(entity: IExternalEntityPayload) {
    try {
      const response = await axiosClient.post(
        `${baseUrl}/ExternalEntity/CreateExternalEntity`,
        entity
      );
      return response.data as IResponse<boolean>;
    } catch (error: any) {
      console.error('Exception creating external entity:', {
        message: error?.message || 'Unknown error',
        status: error?.response?.status || 'No status'
      });
      return {
        succeeded: false,
        data: false,
        message:
          error?.response?.data?.message || 'Failed to create external entity',
        errors: error?.response?.data?.errors || ['Creation failed'],
        code: error?.response?.data?.code || 'CREATE_ERROR'
      } as IResponse<boolean>;
    }
  },

  async updateExternalEntity(entity: IExternalEntityPayload) {
    if (!entity.id) {
      //  console.warn('updateExternalEntity called without an entity ID');
      return {
        succeeded: false,
        data: false,
        message: 'Invalid entity ID provided',
        errors: ['Entity ID is required'],
        code: 'INVALID_INPUT'
      } as IResponse<boolean>;
    }

    try {
      const response = await axiosClient.put(
        `${baseUrl}/ExternalEntity/UpdateExternalEntity`,
        entity
      );
      return response.data as IResponse<boolean>;
    } catch (error: any) {
      console.error(`Exception updating external entity ${entity.id}:`, {
        message: error?.message || 'Unknown error',
        status: error?.response?.status || 'No status'
      });
      return {
        succeeded: false,
        data: false,
        message:
          error?.response?.data?.message || 'Failed to update external entity',
        errors: error?.response?.data?.errors || ['Update failed'],
        code: error?.response?.data?.code || 'UPDATE_ERROR'
      } as IResponse<boolean>;
    }
  },

  async updateExternalEntityStatus(id: string, status: number) {
    if (!id) {
      // console.warn('updateExternalEntityStatus called without a record ID');
      return {
        succeeded: false,
        data: false,
        message: 'Invalid record ID provided',
        errors: ['Record ID is required'],
        code: 'INVALID_INPUT'
      } as IResponse<boolean>;
    }

    try {
      const request = {
        id: id,
        statusId: status,
        tableName: 3 // External entity table
      };

      const response = await axiosClient.patch(
        `${baseUrl}/ChangeStatus/ChangeStatus`,
        request
      );
      return response.data as IResponse<boolean>;
    } catch (error: any) {
      console.error(`Exception updating status for external entity ${id}:`, {
        message: error?.message || 'Unknown error',
        status: error?.response?.status || 'No status'
      });
      return {
        succeeded: false,
        data: false,
        message: error?.response?.data?.message || 'Failed to update status',
        errors: error?.response?.data?.errors || ['Status update failed'],
        code: error?.response?.data?.code || 'STATUS_UPDATE_ERROR'
      } as IResponse<boolean>;
    }
  }
};
