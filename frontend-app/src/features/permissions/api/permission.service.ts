import { axiosClient, axiosInstance } from '@/lib/axios';
import { IResponseList, IResponse } from '@/types/response';
import { IPermissionList, IPermissionDetail, IPermissionPayload } from '@/features/permissions/types/permission';

const baseUrl = process.env.API_URL || 'http://localhost:5000/BDFM/v1/api';

export const permissionService = {
    async getPermissions(query?: Record<string, any>) {
        try {
            const response = await axiosInstance.get(`${baseUrl}/Permission/GetPermissionList`, { params: query });

            if (response.status >= 400) {
                // console.error('Error fetching permissions:', response.statusText);
                return null;
            }

            return response.data as IResponseList<IPermissionList> || null;
        } catch (error) {
            // console.error('Exception fetching permissions:', error);
            return null;
        }
    },



    async getPermissionDetail(id: string) {
        try {
            const response = await axiosInstance.get(`${baseUrl}/Permission/GetPermissionById/${id}`);

            if (response.status >= 400) {
                // console.error(`Error fetching permission ${id}:`, response.statusText);
                return null;
            }

            return response.data as IResponse<IPermissionDetail> || null;
        } catch (error) {
            // console.error(`Exception fetching permission ${id}:`, error);
            return null;
        }
    },

    async createPermission(payload: IPermissionPayload) {
        try {
            const response = await axiosClient.post(`${baseUrl}/Permission/CreatePermission`, payload);

            if (response.status >= 400) {
                // console.error('Error creating permission:', response.statusText);
                return null;
            }

            return response.data as IResponse<boolean> || null;
        } catch (error) {
            // console.error('Exception creating permission:', error);
            return null;
        }
    },

    async updatePermission(payload: IPermissionPayload) {
        try {
            const response = await axiosClient.put(`${baseUrl}/Permission/UpdatePermission`, payload);

            if (response.status >= 400) {
                // console.error('Error updating permission:', response.statusText);
                return null;
            }

            return response.data as IResponse<boolean> || null;
        } catch (error) {
            // console.error('Exception updating permission:', error);
            return null;
        }
    },

    async updatePermissionStatus(id: string, status: number) {
        try {
            const response = await axiosClient.patch(`${baseUrl}/Permission/ChangeStatus/ChangeStatus`, {
                id: id,
                statusId: status,
                tableName: 4, // Assuming 4 is for permission table
            });

            if (response.status >= 400) {
                // console.error(`Error updating status for permission ${id}:`, response.statusText);
                return null;
            }

            return response.data as IResponse<boolean> || null;
        } catch (error) {
            // console.error(`Exception updating status for permission ${id}:`, error);
            return null;
        }
    },



    async deletePermission(id: string) {
        try {
            const response = await axiosClient.delete(`${baseUrl}/Permission/DeletePermissionById/${id}`);

            if (response.status >= 400) {
                // console.error(`Error deleting permission ${id}:`, response.statusText);
                return null;
            }

            return response.data as IResponse<boolean> || null;
        } catch (error) {
            // console.error(`Exception deleting permission ${id}:`, error);
            return null;
        }
    },



};
