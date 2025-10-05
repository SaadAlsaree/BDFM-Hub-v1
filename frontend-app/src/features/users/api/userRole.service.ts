import { axiosClient } from '@/lib/axios';
import { IResponse, IResponseList } from '@/types/response';
import { AssignUserRolesDto, CreateUserRoleDto, IUserRoleResponse } from '../types/user';

const baseUrl = process.env.API_URL || 'http://localhost:5000/BDFM/v1/api';

class UserRoleService {
    async updateUserRoles(userRole: AssignUserRolesDto) {
        try {
            if (!userRole.userId || !userRole.roleIds) {
                console.error('updateUserRoles called with invalid data', userRole);
                return null;
            }

            const response = await axiosClient.post(`${baseUrl}/UserRole/AssignRolesToUser`, userRole);

            if (response.status >= 400) {
                console.error(`Error updating roles for user ${userRole.userId}:`, response.statusText);
                return null;
            }

            return response.data as IResponse<boolean> || null;
        } catch (error) {
            console.error(`Exception updating roles for user ${userRole.userId}:`, error);
            return null;
        }
    }

    ///BDFM/v1/api/UserRole/CreateUserRole
    async createUserPermission(userPermission: CreateUserRoleDto) {
        try {
            const response = await axiosClient.post(`${baseUrl}/UserRole/CreateUserRole`, userPermission);
            return response.data as IResponse<boolean> || null;
        } catch (error) {
            console.error(`Exception creating user permission:`, error);
            return null;
        }
    }

    ///BDFM/v1/api/UserRole/GetRolesByUserId/user/{userId}/roles
    async getRolesByUserId(userId: string) {
        try {
            const response = await axiosClient.get(`${baseUrl}/UserRole/GetRolesByUserId/user/${userId}/roles`, { params: { page: 1, pageSize: 100 } });
            return response.data as IResponseList<IUserRoleResponse>;
        } catch (error) {
            console.error(`Exception getting roles for user ${userId}:`, error);
            return null;
        }
    }

    ///BDFM/v1/api/UserRole/GetUsersByRoleId/role/{roleId}/users
    async getUsersByRoleId(roleId: string) {
        try {
            const response = await axiosClient.get(`${baseUrl}/UserRole/GetUsersByRoleId/role/${roleId}/users`, { params: { page: 1, pageSize: 100 } });
            return response.data as IResponseList<IUserRoleResponse>;
        } catch (error) {
            console.error(`Exception getting users for role ${roleId}:`, error);
            return null;
        }
    }
}

export const userRoleService: UserRoleService = new UserRoleService();
