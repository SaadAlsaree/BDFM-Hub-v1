import { axiosClient } from '@/lib/axios';
import { IResponse, IResponseList } from '@/types/response';
import { Notification, NotificationQuery } from '@/types/notifications';

const baseUrl = process.env.API_URL || 'http://cm-back.inss.local:5000/BDFM/v1/api';

export const notificationsApi = {
    /**
     * Get user notifications with pagination and filters
     * Endpoint: GET /Notification/GetUserNotifications
     */
    async getUserNotifications(query: NotificationQuery = {}) {
        try {
            const params: Record<string, any> = {
                page: query.page || 1,
                pageSize: query.pageSize || 10,
            };

            // Only add optional parameters if they exist
            if (query.isRead !== undefined) {
                params.isRead = query.isRead;
            }

            if (query.notificationType !== undefined) {
                params.notificationType = query.notificationType;
            }

            const response = await axiosClient
                .get(`${baseUrl}/Notification/GetUserNotifications`, {
                    params
                });

            if (response.status >= 400) {
                return null;
            }

            return response.data as IResponseList<Notification> || null;
        } catch (error) {
            // console.error('Error fetching user notifications:', error);
            return null;
        }
    },

    /**
     * Get user notifications (client-side)
     * Endpoint: GET /Notification/GetUserNotifications
     */
    async getUserNotificationsClient(query: NotificationQuery = {}) {
        try {
            const params: Record<string, any> = {
                page: query.page || 1,
                pageSize: query.pageSize || 10,
            };

            // Only add optional parameters if they exist
            if (query.isRead !== undefined) {
                params.isRead = query.isRead;
            }

            if (query.notificationType !== undefined) {
                params.notificationType = query.notificationType;
            }

            const response = await axiosClient.get(`${baseUrl}/Notification/GetUserNotifications`, {
                params
            });

            if (response.status >= 400) {
                return null;
            }

            return response.data as IResponseList<Notification> || null;
        } catch (error) {
            // console.error('Error fetching user notifications (client):', error);
            return null;
        }
    },

    /**
     * Mark a notification as read
     * Endpoint: PUT /Notification/MarkAsRead/{id}
     */
    async markAsRead(id: string) {
        try {
            const response = await axiosClient.post(`${baseUrl}/Notification/MarkNotificationAsRead`, {
                notificationId: id
            });

            if (response.status >= 400) {
                return null;
            }

            return response.data as IResponse<boolean> || null;
        } catch (error) {
            // console.error(`Error marking notification ${id} as read:`, error);
            return null;
        }
    },

    /**
     * Mark all notifications as read
     * Endpoint: PUT /Notification/MarkAllAsRead
     */
    async markAllAsRead() {
        try {
            const response = await axiosClient.put(`${baseUrl}/Notification/MarkAllNotificationsAsRead`);

            if (response.status >= 400) {
                return null;
            }

            return response.data as IResponse<boolean> || null;
        } catch (error) {
            // console.error('Error marking all notifications as read:', error);
            return null;
        }
    },

    /**
     * Get unread notification count
     * This is a convenience method that fetches only unread notifications and returns the count
     */
    async getUnreadCount() {
        try {
            const response = await this.getUserNotificationsClient({
                page: 1,
                pageSize: 1,
                isRead: false
            });

            if (!response || !response.succeeded) {
                return 0;
            }

            return response.data?.totalCount || 0;
        } catch (error) {
            // console.error('Error fetching unread count:', error);
            return 0;
        }
    },

    /**
     * Get recent notifications for dropdown/bell
     * Returns a limited number of recent notifications
     */
    async getRecentNotifications(limit: number = 10) {
        try {
            const response = await this.getUserNotificationsClient({
                page: 1,
                pageSize: limit
            });

            if (!response || !response.succeeded) {
                return [];
            }

            return response.data?.items || [];
        } catch (error) {
            // console.error('Error fetching recent notifications:', error);
            return [];
        }
    },

    /**
     * Delete a notification (if supported by backend)
     * Endpoint: DELETE /Notification/{id}
     */
    async deleteNotification(id: string) {
        try {
            const response = await axiosClient.delete(`${baseUrl}/Notification/${id}`);

            if (response.status >= 400) {
                return null;
            }

            return response.data ? (response.data as IResponse<boolean>) : null;
        } catch (error) {
            // console.error(`Error deleting notification ${id}:`, error);
            return null;
        }
    },

    /**
     * Bulk mark notifications as read
     * Endpoint: PUT /Notification/BulkMarkAsRead
     */
    async bulkMarkAsRead(ids: string[]) {
        try {
            const response = await axiosClient.put(`${baseUrl}/Notification/BulkMarkAsRead`, {
                notificationIds: ids
            });

            if (response.status >= 400) {
                return null;
            }

            return response.data ? (response.data as IResponse<boolean>) : null;
        } catch (error) {
            // console.error('Error bulk marking notifications as read:', error);
            return null;
        }
    }
}; 