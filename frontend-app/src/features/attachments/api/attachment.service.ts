import { axiosClient, axiosInstance } from '@/lib/axios';
import { IResponseList, IResponse } from '@/types/response';
import {
  FileAttachmentPayload,
  FileAttachmentList,
  FileAttachmentDetail,
  FileAttachmentStatus,
  FileAttachmentQuery
} from '@/features/attachments/types/attachment';



export const attachmentService = {
  async getAttachmentList(query: FileAttachmentQuery) {
    try {
      const response = await axiosInstance.get(
        `/Attachments/GetAttachmentsList`,
        { params: query }
      );
      if (response.status >= 400) {
        // console.error('Error fetching attachments:', response.statusText);
        return null;
      }
      return (response.data as IResponseList<FileAttachmentList>) || null;
    } catch (error) {
      // console.error('Error fetching attachments:', error);
      return null;
    }
  },

  async getAttachmentDetail(id: string) {
    try {
      const response = await axiosInstance.get(
        `/Attachments/GetAttachmentById/${id}`
      );
      if (response.status >= 400) {
        // console.error(`Error fetching attachment ${id}:`, response.statusText);
        return null;
      }
      return (response.data as IResponse<FileAttachmentDetail>) || null;
    } catch (error) {
      // console.error(`Error fetching attachment ${id}:`, error);
      return null;
    }
  },

  async createAttachment(payload: FileAttachmentPayload) {
    try {
      const response = await axiosClient.post(
        `/Attachments/CreateAttachment`,
        payload
      );
      console.log(response);
      if (response.status >= 400) {
        // console.error('Error creating attachment:', response.statusText);
        return null;
      }
      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error('Error creating attachment:', error);
      return null;
    }
  },

  async createAttachmentFormData(
    file: File,
    metadata: {
      primaryTableId: string;
      tableName: number;
      description?: string;
      createBy: string;
    }
  ) {
    try {
      const formData = new FormData();

      // Append the actual file - using 'File' to match the API expectation
      formData.append('File', file);

      // Append metadata with exact field names from the curl example
      formData.append('PrimaryTableId', metadata.primaryTableId);
      formData.append('TableName', metadata.tableName.toString());
      formData.append('Description', metadata.description || file.name);
      formData.append('FileSize', file.size.toString());
      formData.append('OcrText', ''); // Empty as shown in curl example
      formData.append('CreateBy', metadata.createBy);

      const response = await axiosClient.post(
        `/Attachments/CreateAttachment`,
        formData,
        {
          headers: {
            // Remove manual Content-Type to allow browser to set boundary
            'Content-Type': undefined
          }
        }
      );

      if (response.status >= 400) {
        // console.error('Error creating attachment:', response.statusText);
        return null;
      }
      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error('Error creating attachment:', error);
      return null;
    }
  },

  async updateAttachment(payload: FileAttachmentPayload) {
    try {
      const response = await axiosClient.put(
        `/Attachments/UpdateAttachment`,
        payload
      );
      if (response.status >= 400) {
        // console.error('Error updating attachment:', response.statusText);
        return null;
      }
      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error('Error updating attachment:', error);
      return null;
    }
  },

  async updateAttachmentStatus(payload: FileAttachmentStatus) {
    try {
      const response = await axiosClient.put(
        `/Attachment/UpdateAttachmentStatus`,
        payload
      );
      if (response.status >= 400) {
        // console.error('Error updating attachment status:', response.statusText);
        return null;
      }
      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error('Error updating attachment status:', error);
      return null;
    }
  },

  async deleteAttachment(id: string) {
    try {
      const response = await axiosClient.delete(
        `/Attachment/DeleteAttachment/${id}`
      );
      if (response.status >= 400) {
        // console.error('Error deleting attachment:', response.statusText);
        return null;
      }
      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error('Error deleting attachment:', error);
      return null;
    }
  },

  ///Attachments/DownloadAttachment/{id}/download
  async downloadAttachment(id: string) {
    try {
      const response = await axiosInstance.get(
        `/Attachments/DownloadAttachment/${id}/download`
      );
      if (response.status >= 400) {
        // console.error('Error downloading attachment:', response.statusText);
        return null;
      }
      return (response.data as IResponse<string>) || null;
    } catch (error) {
      // console.error('Error downloading attachment:', error);
      return null;
    }
  },

  async downloadAttachmentClient(id: string) {
    try {
      // console.log('axiosClient.get URL:', `/Attachments/DownloadAttachment/${id}/download`);
      const response = await axiosClient.get(
        `/Attachments/DownloadAttachment/${id}/download`,
        { responseType: 'blob' }
      );
      // console.log('axiosClient response status:', response.status);
      if (response.status >= 400) {
        // console.error('Error downloading attachment:', response.statusText);
        return null;
      }
      return response.data as Blob;
    } catch (error) {
      // console.error('Axios error descending from downloadAttachmentClient:', error);
      throw error; // Let the hook catch it so we can see the toast
    }
  },

  async getAttachmentByPrimaryTableId(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `/Attachments/GetAttachmentsByTable`,
        { params: query }
      );
      if (response.status >= 400) {
        // console.error('Error fetching attachment by primary table id:', response.statusText);
        return null;
      }
      return (response.data as IResponseList<FileAttachmentList>) || null;
    } catch (error) {
      // console.error('Error fetching attachment by primary table id:', error);
      return null;
    }
  },

  async getAttachmentByPrimaryTableIdClient(query: Record<string, any>) {
    try {
      const response = await axiosClient.get(
        `/Attachments/GetAttachmentsByTable`,
        { params: query }
      );
      if (response.status >= 400) {
        // console.error('Error fetching attachment by primary table id:', response.statusText);
        return null;
      }
      return (response.data as IResponseList<FileAttachmentList>) || null;
    } catch (error) {
      // console.error('Error fetching attachment by primary table id:', error);
      return null;
    }
  }
};
