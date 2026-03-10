import { axiosInstance, axiosClient } from '@/lib/axios';
import { IResponseList, IResponse } from '@/types/response';
import {
  IAnnouncementDetail,
  IAnnouncementList,
  IAnnouncementPayload,
  IAnnouncementListQuery,
  AnnouncementDto
} from '../types/announcements';



export const announcementsService = {
  async getAnnouncements(query: IAnnouncementListQuery) {
    try {
      const response = await axiosInstance.get(
        `/Announcement/GetAnnouncements`,
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
        `/Announcement/GetActiveAnnouncements`,
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

    async getActiveAnnouncementsClient(query: IAnnouncementListQuery) {
    try {
      const response = await axiosClient.get(
        `/Announcement/GetActiveAnnouncements`,
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
        `/Announcement/GetAnnouncementById/${id}`
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
        `/Announcement/CreateAnnouncement`,
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
        `/Announcement/UpdateAnnouncement`,
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
        `/Announcement/DeleteAnnouncement/${id}`
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
