import { axiosClient, axiosInstance } from '@/lib/axios';
import { IResponse, IResponseList } from '@/types/response';
import {
  AssignUserPermissionsDto,
  CreateUserPermissionDto,
  IUserPermissionResponse,
  RemoveUserPermissionDto
} from '../types/user';



export const userPermissionService = {
  // /UserPermission/AssignPermissionsToUser
  async assignUserPermissions(payload: AssignUserPermissionsDto) {
    try {
      const response = await axiosClient.post(
        `/UserPermission/AssignPermissionsToUser`,
        payload
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      return null;
    }
  },

  // /UserPermission/CreateUserPermission
  async createUserPermission(payload: CreateUserPermissionDto) {
    try {
      const response = await axiosClient.post(
        `/UserPermission/CreateUserPermission`,
        payload
      );
      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      return null;
    }
  },

  ///UserPermission/GetPermissionsByUserId
  async getUserPermissions(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `/UserPermission/GetPermissionsByUserId`,
        { params: query }
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponseList<IUserPermissionResponse>) || null;
    } catch (error) {
      return null;
    }
  },

  // /UserPermission/RemovePermissionFromUser
  async removePermissionFromUser(payload: RemoveUserPermissionDto) {
    try {
      const response = await axiosClient.post(
        `/UserPermission/RemovePermissionFromUser`,
        payload
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      return null;
    }
  }
};
