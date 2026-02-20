import { axiosInstance, axiosClient } from '@/lib/axios';
import { IResponseList, IResponse } from '@/types/response';
import {
  IOrganizationalUnitResponse,
  IOrganizationalUnitDetails,
  CreateOrganizationalUnitPayload,
  IOrganizationalUnitList
} from '@/features/organizational-unit/types/organizational';

const baseUrl =
  process.env.API_URL || 'http://cm-back.inss.local:5000/BDFM/v1/api';

export const organizationalService = {
  async getOrganizationalUnits(query?: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/OrganizationalUnit/GetOrganizationalUnitList`,
        { params: query }
      );

      if (response.status >= 400) {
        // console.error('Error fetching organizational units:', response.statusText);
        return null;
      }

      return (
        (response.data as IResponseList<IOrganizationalUnitResponse>) || null
      );
    } catch (error) {
      // console.error('Exception fetching organizational units:', error);
      return null;
    }
  },

  async getOrganizationalUnitById(id: string) {
    try {
      if (!id) {
        // console.error('getOrganizationalUnitById called without an ID');
        return null;
      }

      const response = await axiosInstance.get(
        `${baseUrl}/OrganizationalUnit/GetOrganizationalUnitById/${id}`
      );

      if (response.status >= 400) {
        // console.error(`Error fetching organizational unit ${id}:`, response.statusText);
        return null;
      }

      return (response.data as IResponse<IOrganizationalUnitDetails>) || null;
    } catch (error) {
      // console.error(`Exception fetching organizational unit ${id}:`, error);
      return null;
    }
  },

  async createOrganizationalUnit(unit: CreateOrganizationalUnitPayload) {
    try {
      const response = await axiosClient.post(
        `${baseUrl}/OrganizationalUnit/CreateOrganizationalUnit`,
        unit
      );

      if (response.status >= 400) {
        // console.error('Error creating organizational unit:', response.statusText);
        return null;
      }

      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error('Exception creating organizational unit:', error);
      return null;
    }
  },

  async updateOrganizationalUnit(unit: CreateOrganizationalUnitPayload) {
    try {
      if (!unit.id) {
        // console.error('updateOrganizationalUnit called without a unit ID');
        return null;
      }

      const response = await axiosClient.put(
        `${baseUrl}/OrganizationalUnit/UpdateOrganizationalUnit`,
        unit
      );

      if (response.status >= 400) {
        // console.error(`Error updating organizational unit ${unit.id}:`, response.statusText);
        return null;
      }

      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error(`Exception updating organizational unit ${unit.id}:`, error);
      return null;
    }
  },

  async getOrganizationalUnitTree() {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/OrganizationalUnit/GetOrganizationalUnitTree/Tree`
      );

      if (response.status >= 400) {
        // console.error('Error fetching organizational unit tree:', response.statusText);
        return null;
      }

      return (response.data as IResponse<any[]>) || null;
    } catch (error) {
      // console.error('Exception fetching organizational unit tree:', error);
      return null;
    }
  },

  async updateOrganizationalUnitStatus(id: string, status: number) {
    try {
      if (!id) {
        // console.error('updateOrganizationalUnitStatus called without a record ID');
        return null;
      }

      const request = {
        id: id,
        statusId: status,
        tableName: 2 // Assuming 2 is for organizational unit table
      };

      const response = await axiosClient.patch(
        `${baseUrl}/ChangeStatus/ChangeStatus`,
        request
      );

      if (response.status >= 400) {
        // console.error(`Error updating status for organizational unit ${id}:`, response.statusText);
        return null;
      }

      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error(`Exception updating status for organizational unit ${id}:`, error);
      return null;
    }
  },

  ///OrganizationalUnit/GetOrganizationalUnitListById
  async getOrganizationalUnitListById(includeInactive: boolean) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/OrganizationalUnit/GetOrganizationalUnitListById`,
        { params: { includeInactive } }
      );

      if (response.status >= 400) {
        // console.error(`Error fetching organizational unit list by id:`, response.statusText);
        return null;
      }

      return (
        (response.data as IResponseList<IOrganizationalUnitResponse>) || null
      );
    } catch (error) {
      // console.error(`Exception fetching organizational unit list by id:`, error);
      return null;
    }
  },

  ///OrganizationalUnit/GetOrganizationalUnitListById Client

  async getOrganizationalUnitListByIdClient(includeInactive: boolean) {
    try {
      const response = await axiosClient.get(
        `${baseUrl}/OrganizationalUnit/GetOrganizationalUnitList`,
        { params: { includeInactive } }
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponseList<IOrganizationalUnitList>) || null;
    } catch (error) {
      return null;
    }
  },

  ///BDFM/v1/api/OrganizationalUnit/Search
  async searchOrganizationalUnits(query: Record<string, any>) {
    if (!query.unit) {
      return null;
    }
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/OrganizationalUnit/Search`,
        { params: query }
      );

      if (response.status >= 400) {
        return null;
      }

      return response.data;
    } catch (error) {
      return null;
    }
  },

  async searchOrganizationalUnitsClient(query: Record<string, any>) {
    if (!query.unit) {
      return null;
    }

    try {
      const response = await axiosClient.get(
        `${baseUrl}/OrganizationalUnit/Search`,
        { params: query }
      );

      if (response.status >= 400) {
        return null;
      }

      return response.data;
    } catch (error) {
      return null;
    }
  },

  ///OrganizationalUnit/DeleteOrganizationalUnit/019a0be4-1405-74f9-95a8-c9ba169a85b1'
  async deleteOrganizationalUnit(id: string) {
    try {
      const response = await axiosClient.delete(
        `${baseUrl}/OrganizationalUnit/DeleteOrganizationalUnit/${id}`
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
