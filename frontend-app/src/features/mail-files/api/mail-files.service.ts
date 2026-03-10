import { axiosInstance, axiosClient } from '@/lib/axios';
import { IResponseList, IResponse } from '@/types/response';
import {
  IMailFileContent,
  IMailFileDetail,
  IMailFilePayload,
  IMailFileListQuery,
  IMailFileContentQuery,
  IMailFileList
} from '@/features/mail-files/types/mail-files';


export const mailFilesService = {
  async getMailFiles(query: IMailFileListQuery) {
    try {
      const response = await axiosInstance.get(
        `/MailFile/GetMailFileList`,
        { params: query }
      );

      if (response.status >= 400) {
        // console.error('Error fetching mail files:', response.statusText);
        return null;
      }

      return (response.data as IResponseList<IMailFileList>) || null;
    } catch (error) {
      // console.error('Exception fetching mail files:', error);
      return null;
    }
  },

  async getMailFileById(id: string) {
    try {
      if (!id) {
        // console.error('getMailFileById called without an ID');
        return null;
      }

      const response = await axiosInstance.get(
        `/MailFile/GetMailFileById/${id}`
      );

      if (response.status >= 400) {
        // console.error(`Error fetching mail file ${id}:`, response.statusText);
        return null;
      }

      return (response.data as IResponse<IMailFileDetail>) || null;
    } catch (error) {
      // console.error(`Exception fetching mail file ${id}:`, error);
      return null;
    }
  },

  async getMailFileContent(id: string, query: IMailFileContentQuery) {
    try {
      if (!query.mailFileId) {
        // console.error('getMailFileContent called without a mailFileId');
        return null;
      }

      const response = await axiosInstance.get(
        `/MailFile/GetMailFileContents/${id}/contents`,
        {
          params: query
        }
      );

      if (response.status >= 400) {
        // console.error(`Error fetching mail file content for ${query.mailFileId}:`, response.statusText);
        return null;
      }

      return (response.data as IResponse<IMailFileContent>) || null;
    } catch (error) {
      // console.error(`Exception fetching mail file content for ${query.mailFileId}:`, error);
      return null;
    }
  },

  async createMailFile(mailFile: IMailFilePayload) {
    try {
      const response = await axiosClient.post(
        `/MailFile/CreateMailFile`,
        mailFile
      );

      if (response.status >= 400) {
        // console.error('Error creating mail file:', response.statusText);
        return null;
      }

      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error('Exception creating mail file:', error);
      return null;
    }
  },

  async updateMailFile(mailFile: IMailFilePayload) {
    try {
      if (!mailFile.id) {
        // console.error('updateMailFile called without a mail file ID');
        return null;
      }

      const response = await axiosClient.put(
        `/MailFile/UpdateMailFile`,
        mailFile
      );

      if (response.status >= 400) {
        // console.error(`Error updating mail file ${mailFile.id}:`, response.statusText);
        return null;
      }

      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error(`Exception updating mail file ${mailFile.id}:`, error);
      return null;
    }
  },

  async updateMailFileStatus(id: string, status: number) {
    try {
      if (!id) {
        // console.error('updateMailFileStatus called without a record ID');
        return null;
      }

      const request = {
        id: id,
        statusId: status,
        tableName: 3 // Assuming 3 is for mail file table
      };

      const response = await axiosClient.patch(
        `/MailFile/ChangeStatus/ChangeStatus`,
        request
      );

      if (response.status >= 400) {
        // console.error(`Error updating status for mail file ${id}:`, response.statusText);
        return null;
      }

      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error(`Exception updating status for mail file ${id}:`, error);
      return null;
    }
  },

  // search mail file /MailFile/SearchMailFiles
  async searchMailFiles(searchTerm: string) {
    try {
      const response = await axiosClient.get(
        `/MailFile/SearchMailFiles?searchTerm=${searchTerm}`
      );
      return response.data as IResponse<IMailFileList[]>;
    } catch (error) {
      // console.error('Error searching mail files:', error);
      return null;
    }
  }
};
