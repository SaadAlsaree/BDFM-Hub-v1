import { axiosClient, axiosInstance } from '@/lib/axios';
import { IResponseList, IResponse } from '@/types/response';
import {
  IRoleDetails,
  IRoleList,
  IRolePayload
} from '@/features/roles/types/role';

const baseUrl = process.env.API_URL || 'http://cm-back.inss.local:5000/BDFM/v1/api';

export const roleService = {
  async getRoles(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(`${baseUrl}/Role/GetRoleList`, {
        params: query
      });

      if (response.status >= 400) {
        // console.error('Error fetching roles:', response.statusText);
        return null;
      }

      return (
        (response.data as IResponseList<{
          items: IRoleList[];
          totalCount: number;
        }>) || null
      );
    } catch (error) {
      // console.error('Exception fetching roles:', error);
      return null;
    }
  },

  async getRoleById(id: string) {
    try {
      if (!id) {
        // console.error('getRoleById called without an ID');
        return null;
      }

      const response = await axiosInstance.get(
        `${baseUrl}/Role/GetRoleById/${id}`
      );

      if (response.status >= 400) {
        // console.error(`Error fetching role ${id}:`, response.statusText);
        return null;
      }

      return (response.data as IResponse<IRoleDetails>) || null;
    } catch (error) {
      // console.error(`Exception fetching role ${id}:`, error);
      return null;
    }
  },

  async createRole(role: IRolePayload) {
    try {
      const response = await axiosClient.post(
        `${baseUrl}/Role/CreateRole`,
        role
      );

      if (response.status >= 400) {
        // console.error('Error creating role:', response.statusText);
        return null;
      }

      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error('Exception creating role:', error);
      return null;
    }
  },

  async updateRole(role: IRolePayload) {
    try {
      if (!role.id) {
        // console.error('updateRole called without a role ID');
        return null;
      }

      const response = await axiosClient.put(
        `${baseUrl}/Role/UpdateRole`,
        role
      );

      if (response.status >= 400) {
        // console.error(`Error updating role ${role.id}:`, response.statusText);
        return null;
      }

      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error(`Exception updating role ${role.id}:`, error);
      return null;
    }
  },

  async updateRoleStatus(id: string, status: number) {
    try {
      if (!id) {
        //  console.error('updateRoleStatus called without a record ID');
        return null;
      }

      const request = {
        id: id,
        statusId: status,
        tableName: 3 // Assuming 3 is for role table
      };

      const response = await axiosClient.patch(
        `${baseUrl}/Role/ChangeStatus/ChangeStatus`,
        request
      );

      if (response.status >= 400) {
        // console.error(`Error updating status for role ${id}:`, response.statusText);
        return null;
      }

      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error(`Exception updating status for role ${id}:`, error);
      return null;
    }
  }
};
