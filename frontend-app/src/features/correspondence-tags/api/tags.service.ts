import { axiosClient, axiosInstance } from '@/lib/axios';
import { CorrespondenceTag } from '../types/tags';
import { IResponse, IResponseList } from '@/types/response';
import { CorrespondenceDetails } from '@/features/correspondence/inbox-list/types/correspondence-details';

const baseUrl = process.env.API_URL || 'http://localhost:5000/BDFM/v1/api';

export const tagsService = {
  ///BDFM/v1/api/Tag/CreateTag
  async createTag(payload: CorrespondenceTag) {
    try {
      const response = await axiosClient.post(
        `${baseUrl}/Tag/CreateTag`,
        payload
      );
      if (response.status >= 400) {
        console.error('Error creating tag:', response.statusText);
        return null;
      }
      return response.data as IResponse<boolean>;
    } catch (error) {
      console.error('Error creating tag:', error);
      return null;
    }
  },

  ///BDFM/v1/api/Tag/UpdateTag
  async updateTag(payload: CorrespondenceTag) {
    try {
      const response = await axiosClient.put(
        `${baseUrl}/Tag/UpdateTag`,
        payload
      );
      if (response.status >= 400) {
        console.error('Error updating tag:', response.statusText);
        return null;
      }
      return response.data as IResponse<boolean>;
    } catch (error) {
      console.error('Error updating tag:', error);
      return null;
    }
  },

  ///BDFM/v1/api/Tag/SoftDeleteTag/SoftDelete/{id}
  async softDeleteTag(id: string) {
    try {
      const response = await axiosClient.delete(
        `${baseUrl}/Tag/SoftDeleteTag/SoftDelete/${id}`
      );
      if (response.status >= 400) {
        console.error('Error soft deleting tag:', response.statusText);
        return null;
      }
      return response.data as IResponse<boolean>;
    } catch (error) {
      console.error('Error soft deleting tag:', error);
      return null;
    }
  },

  ///BDFM/v1/api/Tag/GetTagList
  async getTagList(query: Record<string, any>) {
    try {
      const response = await axiosClient.get(`${baseUrl}/Tag/GetTagList`, {
        params: query
      });
      if (response.status >= 400) {
        console.error('Error getting tag list:', response.statusText);
        return null;
      }
      return response.data as IResponse<boolean>;
    } catch (error) {
      console.error('Error getting tag list:', error);
      return null;
    }
  },

  ///BDFM/v1/api/Tag/GetCorrespondencesWithTags
  async getCorrespondencesWithTags(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Tag/GetCorrespondencesWithTags`,
        { params: query }
      );
      if (response.status >= 400) {
        console.error(
          'Error getting correspondences with tags:',
          response.statusText
        );
        return null;
      }
      return response.data as IResponseList<CorrespondenceDetails>;
    } catch (error) {
      console.error('Error getting correspondences with tags:', error);
      return null;
    }
  }
};
