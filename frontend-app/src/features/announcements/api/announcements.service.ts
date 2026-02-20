import { axiosInstance, axiosClient } from '@/lib/axios';
import { IResponseList, IResponse } from '@/types/response';
import {
  IAnnouncementDetail,
  IAnnouncementList,
  IAnnouncementPayload,
  IAnnouncementListQuery,
  AnnouncementDto
} from '../types/announcements';

const baseUrl =
  process.env.API_URL || 'http://cm-back.inss.local:5000/BDFM/v1/api';

export const announcementsService = {
  async getAnnouncements(query: IAnnouncementListQuery) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Announcement/GetAnnouncements`,
        { params: query }
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponseList<IAnnouncementList>) || null;
    } catch (error) {
      return null;
    }
  },

  async getActiveAnnouncements(query: IAnnouncementListQuery) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Announcement/GetActiveAnnouncements`,
        { params: query }
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponseList<IAnnouncementList>) || null;
    } catch (error) {
      return null;
    }
  },

  async getAnnouncementById(id: string) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Announcement/GetAnnouncementById/${id}`
      );

      if (response.status >= 400) {
        return null;
      }

      return (response.data as IResponse<IAnnouncementDetail>) || null;
    } catch (error) {
      return null;
    }
  },

  async createAnnouncement(payload: IAnnouncementPayload) {
    try {
      const response = await axiosClient.post(
        `${baseUrl}/Announcement/CreateAnnouncement`,
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

  async updateAnnouncement(payload: IAnnouncementPayload) {
    try {
      const response = await axiosClient.put(
        `${baseUrl}/Announcement/UpdateAnnouncement`,
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

  async deleteAnnouncement(id: string) {
    try {
      const response = await axiosClient.delete(
        `${baseUrl}/Announcement/DeleteAnnouncement/${id}`
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
