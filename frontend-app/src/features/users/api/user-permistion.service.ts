import { axiosClient, axiosInstance } from '@/lib/axios';
import { IResponse, IResponseList } from '@/types/response';
import { AssignUserPermissionsDto, CreateUserPermissionDto, IUserPermissionResponse, RemoveUserPermissionDto } from '../types/user';


const baseUrl = process.env.API_URL || 'http://cm-back.inss.local:5000/BDFM/v1/api';


export const userPermissionService = {

    // /UserPermission/AssignPermissionsToUser
    async assignUserPermissions(payload: AssignUserPermissionsDto) {
        try {
            const response = await axiosClient.post(`${baseUrl}/UserPermission/AssignPermissionsToUser`, payload);

            if (response.status >= 400) {
                return null;
            }

            return response.data as IResponse<boolean> || null;
        } catch (error) {
            return null;
        }
    },

    // /UserPermission/CreateUserPermission
    async createUserPermission(payload: CreateUserPermissionDto) {
        try {
            const response = await axiosClient.post(`${baseUrl}/UserPermission/CreateUserPermission`, payload);
            return response.data as IResponse<boolean> || null;
        } catch (error) {
            return null;
        }
    },

    ///UserPermission/GetPermissionsByUserId
    async getUserPermissions(query: Record<string, any>) {
        try {
            const response = await axiosInstance.get(`${baseUrl}/UserPermission/GetPermissionsByUserId`, { params: query });

            if (response.status >= 400) {
                return null;
            }

            return response.data as IResponseList<IUserPermissionResponse> || null;
        } catch (error) {
            return null;
        }
    },

    // /UserPermission/RemovePermissionFromUser
    async removePermissionFromUser(payload: RemoveUserPermissionDto) {
        try {
            const response = await axiosClient.post(`${baseUrl}/UserPermission/RemovePermissionFromUser`, payload);

            if (response.status >= 400) {
                return null;
            }

            return response.data as IResponse<boolean> || null;
        } catch (error) {
            return null;
        }
    },


}

