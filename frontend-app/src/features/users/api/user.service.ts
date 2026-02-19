import { axiosInstance, axiosClient } from '@/lib/axios';
import { IResponseList, IResponse } from '@/types/response';
import {
  IUserResponse,
  UserDetailed,
  UserPayloadDto,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ChangeStatus,
  ImportFromCsvResponse
} from '@/features/users/types/user';

const baseUrl = process.env.API_URL || 'http://cm-back.inss.local:5000/BDFM/v1/api';

export const userService = {
  async getUsers(query: Record<string, any>) {
    try {
      // Create params object with only the properties that are defined
      const params: Record<string, any> = {
        Page: query.page || 1,
        PageSize: query.pageSize || 10
      };

      // Only add filters if they exist
      if (
        query.status !== undefined &&
        query.status !== null &&
        query.status !== ''
      ) {
        params.Status = query.status;
      }

      if (query.searchTerm) {
        params.SearchTerm = query.searchTerm;
      }

      if (query.organizationalUnit) {
        params.OrganizationalUnit = query.organizationalUnit;
      }

      if (query.isActive !== undefined) {
        params.IsActive = query.isActive;
      }

      if (query.username) {
        params.Username = query.username;
      }

      const response = await axiosInstance.get(`${baseUrl}/User/GetAllUsers`, {
        params
      });

      if (response.status >= 400) {
        // console.error('Error fetching users:', response.statusText);
        return null;
      }

      return (response.data as IResponseList<IUserResponse>) || null;
    } catch (error) {
      // console.error('Exception fetching users:', error);
      return null;
    }
  },

  async getUserById(id: string) {
    try {
      if (!id) {
        // console.error('getUserById called without an ID');
        return null;
      }

      const response = await axiosInstance.get(
        `${baseUrl}/User/GetUserById/${id}`
      );

      if (response.status >= 400) {
        // console.error(`Error fetching user ${id}:`, response.statusText);
        return null;
      }

      return (response.data as IResponse<UserDetailed>) || null;
    } catch (error) {
      // console.error(`Exception fetching user ${id}:`, error);
      return null;
    }
  },

  async createUser(user: UserPayloadDto) {
    try {
      const response = await axiosClient.post(
        `${baseUrl}/User/CreateUser`,
        user
      );

      if (response.status >= 400) {
        // console.error('Error creating user:', response.statusText);
        console.log(response);

        return null;
      }

      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error('Exception creating user:', error);
      return null;
    }
  },

  async updateUser(user: UserPayloadDto) {
    try {
      if (!user.id) {
        // console.error('updateUser called without a user ID');
        return null;
      }

      const response = await axiosClient.put(
        `${baseUrl}/User/UpdateUser`,
        user
      );

      if (response.status >= 400) {
        // console.error(`Error updating user ${user.id}:`, response.statusText);
        return null;
      }

      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error(`Exception updating user ${user.id}:`, error);
      return null;
    }
  },

  // async deleteUser(id: string) {
  //   try {
  //     const response = await axiosClient.delete(`${baseUrl}/Auth/DeleteAuth/${id}`);

  //     if (response.status === 400) {
  //       return null;
  //     }
  //     return response.data?.data as IResponse<boolean> || null;
  //   } catch (error) {
  //     return null;
  //   }
  // },

  async changePassword(request: ChangePasswordRequest) {
    try {
      if (!request.userId) {
        //    console.error('changePassword called without a user ID');
        return null;
      }

      const response = await axiosClient.put(
        `${baseUrl}/User/ChangePassword`,
        request
      );

      if (response.status >= 400) {
        // console.error(`Error changing password for user ${request.id}:`, response.statusText);
        return null;
      }

      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error(`Exception changing password for user ${request.id}:`, error);
      return null;
    }
  },

  async resetPassword(request: ResetPasswordRequest) {
    try {
      if (!request.userId) {
        // console.error('resetPassword called without a user ID');
        return null;
      }

      const payload = {
        userId: request.userId,
        newPassword: request.newPassword,
        confirmNewPassword: request.confirmNewPassword
      };

      const response = await axiosClient.put(
        `${baseUrl}/User/ResetPassword`,
        payload
      );

      if (response.status >= 400) {
        // console.error(`Error resetting password for user ${request.id}:`, response.statusText);
        return null;
      }

      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error(`Exception resetting password for user ${request.id}:`, error);
      return null;
    }
  },

  async updateUserStatus(request: ChangeStatus) {
    try {
      if (!request.id) {
        // console.error('updateUserStatus called without a record ID');
        return null;
      }

      const response = await axiosClient.patch(
        `${baseUrl}/ChangeStatus/ChangeStatus`,
        request
      );

      if (response.status >= 400) {
        // console.error(`Error updating status for record ${request.id}:`, response.statusText);
        return null;
      }

      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      //  console.error(`Exception updating status for record ${request.id}:`, error);
      return null;
    }
  },

  //BDFM/v1/api/User/SearchUser?User=test
  async searchUser(query: Record<string, any>) {
    try {
      if (!query.user) {
        // console.error('searchUser called without a search term');
        return null;
      }

      const response = await axiosInstance.get(`${baseUrl}/User/SearchUser`, {
        params: query
      });

      if (response.status >= 400) {
        // console.error(`Error searching user with term "${term}":`, response.statusText);
        return null;
      }

      return response.data;
    } catch (error) {
      // console.error(`Exception searching user with term "${term}":`, error);
      return null;
    }
  },

  //BDFM/v1/api/User/SearchUser Client
  async searchUserClient(query: Record<string, any>) {
    try {
      if (!query.user) {
        // console.error('searchUserClient called without a search term');
        return null;
      }
      const response = await axiosClient.get(`${baseUrl}/User/SearchUser`, {
        params: query
      });

      if (response.status >= 400) {
        // console.error(`Error searching user with term "${term}":`, response.statusText);
        return null;
      }
      return response.data;
    } catch (error) {
      // console.error(`Exception searching user with term "${term}":`, error);
      return null;
    }
  },

  async importFromCsv(file: File) {
    try {
      const formData = new FormData();
      formData.append('File', file);

      const response = await axiosClient.post(
        `${baseUrl}/User/ImportFromCsv`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponse<ImportFromCsvResponse>) || null;
    } catch (error) {
      return null;
    }
  }
};
