import { axiosClient } from '@/lib/axios';
import { IResponse } from '@/types/response';

const baseUrl = process.env.API_URL || 'http://cm-back.inss.local:5000/BDFM/v1/api';

export const notificationManagementApi = {
    /**
     * Mark a specific notification as read
     * @param notificationId - The ID of the notification to mark as read
     */
    async markAsRead(notificationId: string): Promise<boolean> {
        try {
            const response = await axiosClient.post(`${baseUrl}/Notification/MarkNotificationAsRead`, {
                notificationId
            });

            return response.data?.succeeded || false;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    },

    /**
     * Mark all notifications as read for the current user
     */
    async markAllAsRead(): Promise<boolean> {
        try {
            const response = await axiosClient.post(`${baseUrl}/Notification/MarkAllNotificationsAsRead`, {});

            return response.data?.succeeded || false;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return false;
        }
    },

    /**
     * Get user notifications with pagination
     * @param page - Page number (default: 1)
     * @param pageSize - Number of items per page (default: 20)
     */
    async getNotifications(page: number = 1, pageSize: number = 20) {
        try {
            const response = await axiosClient.get(`${baseUrl}/Notification/GetUserNotifications`, {
                params: { page, pageSize }
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return null;
        }
    },

    /**
     * Enable/disable notifications for a specific correspondence
     * @param correspondenceId - The ID of the correspondence
     * @param receiveNotifications - Whether to receive notifications
     */
    async setCorrespondenceNotifications(correspondenceId: string, receiveNotifications: boolean): Promise<boolean> {
        try {
            const response = await axiosClient.post(`${baseUrl}/UserCorrespondenceInteraction/ReceiveNotification`, {
                correspondenceId,
                receiveNotifications
            });

            return response.data?.succeeded || false;
        } catch (error) {
            console.error('Error setting correspondence notifications:', error);
            return false;
        }
    },

    /**
     * Get unread notification count
     */
    async getUnreadCount(): Promise<number> {
        try {
            const response = await axiosClient.get(`${baseUrl}/Notification/GetUnreadCount`);

            return response.data?.data || 0;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return 0;
        }
    },

    /**
     * Delete a specific notification
     * @param notificationId - The ID of the notification to delete
     */
    async deleteNotification(notificationId: string): Promise<boolean> {
        try {
            const response = await axiosClient.delete(`${baseUrl}/Notification/${notificationId}`);

            return response.data?.succeeded || false;
        } catch (error) {
            console.error('Error deleting notification:', error);
            return false;
        }
    }
}; 