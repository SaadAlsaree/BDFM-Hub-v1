import { axiosClient, axiosInstance } from '@/lib/axios';
import { IResponseList, IResponse } from '@/types/response';
import { IRoleList, RolePermissionAssignmentDto } from '../types/role';
import { IPermissionList } from '@/features/permissions/types/permission';

const baseUrl =
  process.env.API_URL || 'http://cm-back.inss.local:5000/BDFM/v1/api';

export const rolePermissionService = {
  async updateRolePermissions(payload: RolePermissionAssignmentDto) {
    try {
      const response = await axiosClient.post(
        `${baseUrl}/RolePermission/AssignPermissionsToRole`,
        payload
      );

      if (response.status >= 400) {
        // Error updating role permissions
        return null;
      }

      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // Exception updating role permissions
      return null;
    }
  },

  // /RolePermission/GetPermissionsByRoleId/role/{roleId}/permissions

  async getPermissionsForARoleById(roleId: string, query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/RolePermission/GetPermissionsByRoleId/${roleId}/permissions`,
        { params: query }
      );

      if (response.status >= 400) {
        // Error updating role permissions
        return null;
      }

      return (response.data as IResponseList<IRoleList>) || null;
    } catch (error) {
      // Exception updating role permissions
      return null;
    }
  },

  // /RolePermission/GetRolesByPermissionId/permission/{permissionId}/roles

  async getRolesForAPermissionById(
    permissionId: string,
    query: Record<string, any>
  ) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/RolePermission/GetRolesByPermissionId/${permissionId}/roles`,
        { params: query }
      );

      if (response.status >= 400) {
        // Error updating role permissions
        return null;
      }

      return (response.data as IResponseList<IPermissionList>) || null;
    } catch (error) {
      // Exception updating role permissions
      return null;
    }
  }
};
