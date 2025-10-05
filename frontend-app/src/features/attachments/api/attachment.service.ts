import { axiosClient, axiosInstance } from '@/lib/axios';
import { IResponseList, IResponse } from '@/types/response';
import { FileAttachmentPayload, FileAttachmentList, FileAttachmentDetail, FileAttachmentStatus, FileAttachmentQuery } from '@/features/attachments/types/attachment';



const baseUrl = process.env.API_URL || 'http://localhost:5000/BDFM/v1/api';

export const attachmentService = {
    async getAttachmentList(query: FileAttachmentQuery) {
        try {
            const response = await axiosInstance.get(`${baseUrl}/Attachments/GetAttachmentsList`, { params: query });
            if (response.status >= 400) {
                // console.error('Error fetching attachments:', response.statusText);
                return null;
            }
            return response.data as IResponseList<FileAttachmentList> || null;
        } catch (error) {
            // console.error('Error fetching attachments:', error);
            return null;
        }
    },

    async getAttachmentDetail(id: string) {
        try {
            const response = await axiosInstance.get(`${baseUrl}/Attachments/GetAttachmentById/${id}`);
            if (response.status >= 400) {
                // console.error(`Error fetching attachment ${id}:`, response.statusText);
                return null;
            }
            return response.data as IResponse<FileAttachmentDetail> || null;
        } catch (error) {
            // console.error(`Error fetching attachment ${id}:`, error);
            return null;
        }
    },

    async createAttachment(payload: FileAttachmentPayload) {
        try {
            const response = await axiosClient.post(`${baseUrl}/Attachments/CreateAttachment`, payload);
            if (response.status >= 400) {
                // console.error('Error creating attachment:', response.statusText);
                return null;
            }
            return response.data as IResponse<boolean> || null;
        } catch (error) {
            // console.error('Error creating attachment:', error);
            return null;
        }
    },

    async createAttachmentFormData(file: File, metadata: {
        primaryTableId: string;
        tableName: number;
        description?: string;
        createBy: string;
    }) {
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

            const response = await axiosClient.post(`${baseUrl}/Attachments/CreateAttachment`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status >= 400) {
                // console.error('Error creating attachment:', response.statusText);
                return null;
            }
            return response.data as IResponse<boolean> || null;
        } catch (error) {
            // console.error('Error creating attachment:', error);
            return null;
        }
    },

    async updateAttachment(payload: FileAttachmentPayload) {
        try {
            const response = await axiosClient.put(`${baseUrl}/Attachments/UpdateAttachment`, payload);
            if (response.status >= 400) {
                // console.error('Error updating attachment:', response.statusText);
                return null;
            }
            return response.data as IResponse<boolean> || null;
        } catch (error) {
            // console.error('Error updating attachment:', error);
            return null;
        }

    },

    async updateAttachmentStatus(payload: FileAttachmentStatus) {
        try {
            const response = await axiosClient.put(`${baseUrl}/Attachment/UpdateAttachmentStatus`, payload);
            if (response.status >= 400) {
                // console.error('Error updating attachment status:', response.statusText);
                return null;
            }
            return response.data as IResponse<boolean> || null;
        } catch (error) {
            // console.error('Error updating attachment status:', error);
            return null;
        }
    },

    async deleteAttachment(id: string) {
        try {
            const response = await axiosClient.delete(`${baseUrl}/Attachment/DeleteAttachment/${id}`);
            if (response.status >= 400) {
                // console.error('Error deleting attachment:', response.statusText);
                return null;
            }
            return response.data as IResponse<boolean> || null;
        } catch (error) {
            // console.error('Error deleting attachment:', error);
            return null;
        }
    },

    ///Attachments/DownloadAttachment/{id}/download
    async downloadAttachment(id: string) {
        try {
            const response = await axiosInstance.get(`${baseUrl}/Attachments/DownloadAttachment/${id}/download`);
            if (response.status >= 400) {
                // console.error('Error downloading attachment:', response.statusText);
                return null;
            }
            return response.data as IResponse<string> || null;
        } catch (error) {
            // console.error('Error downloading attachment:', error);
            return null;
        }
    },

    async getAttachmentByPrimaryTableId(query: Record<string, any>) {
        try {
            const response = await axiosInstance.get(`${baseUrl}/Attachments/GetAttachmentsByTable`, { params: query });
            if (response.status >= 400) {
                // console.error('Error fetching attachment by primary table id:', response.statusText);
                return null;
            }
            return response.data as IResponseList<FileAttachmentList> || null;
        } catch (error) {
            // console.error('Error fetching attachment by primary table id:', error);
            return null;
        }
    }

}

