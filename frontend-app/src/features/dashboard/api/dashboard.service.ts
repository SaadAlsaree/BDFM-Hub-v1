import { axiosInstance, axiosClient } from '@/lib/axios';
import { IResponse } from '@/types/response';
import {
    DashboardQuery,
    CorrespondenceMetricsQuery,
    BacklogDetailsQuery,
    PerformanceAnalyticsQuery,
    DashboardOverviewViewModel,
    CorrespondenceMetricsViewModel,
    BacklogDetailsViewModel,
    PerformanceAnalyticsViewModel,
    QuickStatsViewModel,
    CorrespondenceTypeDistribution,
    CorrespondenceStatusDistribution,
    UnitCorrespondenceVolume,
    AutomationPerformanceMetrics
} from '../types';
import {
    CorrespondenceDashboardSummary,
    DailyPerformanceSummaryViewModel,
    DailyPerformanceQuery
} from '../types/overview';

const baseUrl = process.env.API_URL || 'http://cm-back.inss.local:5000/BDFM/v1/api';

export const dashboardService = {
    /**
     * Get comprehensive dashboard overview
     * Endpoint: GET /Dashboard/GetOverview
     */
    async getDashboardOverview(query?: DashboardQuery) {
        try {
            const response = await axiosInstance.get(`${baseUrl}/Dashboard/GetOverview`, {
                params: query
            });

            if (response.status >= 400) {
                return null;
            }

            return response.data as IResponse<CorrespondenceDashboardSummary> || null;
        } catch (error) {
            // console.error('Error fetching dashboard overview:', error);
            return null;
        }
    },

    /**
     * Get detailed correspondence metrics
     * Endpoint: GET /Dashboard/GetCorrespondenceMetrics
     */
    async getCorrespondenceMetrics(query?: CorrespondenceMetricsQuery) {
        try {
            const response = await axiosInstance.get(`${baseUrl}/Dashboard/GetCorrespondenceMetrics`, {
                params: query
            });

            if (response.status >= 400) {
                return null;
            }

            return response.data as IResponse<CorrespondenceMetricsViewModel> || null;
        } catch (error) {
            // console.error('Error fetching correspondence metrics:', error);
            return null;
        }
    },

    /**
     * Get detailed backlog information
     * Endpoint: GET /Dashboard/GetBacklogDetails
     */
    async getBacklogDetails(query?: BacklogDetailsQuery) {
        try {
            const response = await axiosInstance.get(`${baseUrl}/Dashboard/GetBacklogDetails`, {
                params: query
            });

            if (response.status >= 400) {
                return null;
            }

            return response.data as IResponse<BacklogDetailsViewModel> || null;
        } catch (error) {
            // console.error('Error fetching backlog details:', error);
            return null;
        }
    },

    /**
     * Get performance analytics
     * Endpoint: GET /Dashboard/GetPerformanceAnalytics
     */
    async getPerformanceAnalytics(query?: PerformanceAnalyticsQuery) {
        try {
            const response = await axiosInstance.get(`${baseUrl}/Dashboard/GetPerformanceAnalytics`, {
                params: query
            });

            if (response.status >= 400) {
                return null;
            }

            return response.data as IResponse<PerformanceAnalyticsViewModel> || null;
        } catch (error) {
            // console.error('Error fetching performance analytics:', error);
            return null;
        }
    },

    /**
     * Get unread correspondence count
     * Endpoint: GET /Dashboard/GetUnreadCount
     */
    async getUnreadCount(unitId?: string) {
        try {
            const response = await axiosInstance.get(`${baseUrl}/Dashboard/GetUnreadCount`, {
                params: unitId ? { unitId } : undefined
            });

            if (response.status >= 400) {
                return null;
            }

            return response.data as IResponse<number> || null;
        } catch (error) {
            // console.error('Error fetching unread count:', error);
            return null;
        }
    },

    /**
     * Get correspondence type distribution
     * Endpoint: GET /Dashboard/GetTypeDistribution
     */
    async getTypeDistribution(query?: DashboardQuery) {
        try {
            const response = await axiosInstance.get(`${baseUrl}/Dashboard/GetTypeDistribution`, {
                params: query
            });

            if (response.status >= 400) {
                return null;
            }

            return response.data as IResponse<CorrespondenceTypeDistribution[]> || null;
        } catch (error) {
            // console.error('Error fetching type distribution:', error);
            return null;
        }
    },

    /**
     * Get correspondence status distribution
     * Endpoint: GET /Dashboard/GetStatusDistribution
     */
    async getStatusDistribution(query?: DashboardQuery) {
        try {
            const response = await axiosInstance.get(`${baseUrl}/Dashboard/GetStatusDistribution`, {
                params: query
            });

            if (response.status >= 400) {
                return null;
            }

            return response.data as IResponse<CorrespondenceStatusDistribution[]> || null;
        } catch (error) {
            // console.error('Error fetching status distribution:', error);
            return null;
        }
    },

    /**
     * Get top performing organizational units
     * Endpoint: GET /Dashboard/GetTopUnits
     */
    async getTopUnits(query?: Pick<DashboardQuery, 'startDate' | 'endDate'>) {
        try {
            const response = await axiosInstance.get(`${baseUrl}/Dashboard/GetTopUnits`, {
                params: query
            });

            if (response.status >= 400) {
                return null;
            }

            return response.data as IResponse<UnitCorrespondenceVolume[]> || null;
        } catch (error) {
            // console.error('Error fetching top units:', error);
            return null;
        }
    },

    /**
     * Get automation performance metrics
     * Endpoint: GET /Dashboard/GetAutomationPerformance
     */
    async getAutomationPerformance(query?: DashboardQuery) {
        try {
            const response = await axiosInstance.get(`${baseUrl}/Dashboard/GetAutomationPerformance`, {
                params: query
            });

            if (response.status >= 400) {
                return null;
            }

            return response.data as IResponse<AutomationPerformanceMetrics> || null;
        } catch (error) {
            // console.error('Error fetching automation performance:', error);
            return null;
        }
    },

    /**
     * Get quick stats for dashboard cards
     * Endpoint: GET /Dashboard/GetQuickStats
     */
    async getQuickStats(unitId?: string) {
        try {
            const response = await axiosInstance.get(`${baseUrl}/Dashboard/GetQuickStats`, {
                params: unitId ? { unitId } : undefined
            });

            if (response.status >= 400) {
                return null;
            }

            return response.data as IResponse<QuickStatsViewModel> || null;
        } catch (error) {
            // console.error('Error fetching quick stats:', error);
            return null;
        }
    },

    /**
     * Get daily performance summary
     * Endpoint: GET /Dashboard/GetDailyPerformanceSummary
     */
    async getDailyPerformanceSummary(query?: DailyPerformanceQuery) {
        try {
            const response = await axiosInstance.get(`${baseUrl}/Dashboard/GetDailyPerformanceSummary`, {
                params: query
            });

            if (response.status >= 400) {
                return null;
            }

            return response.data as IResponse<DailyPerformanceSummaryViewModel> || null;
        } catch (error) {
            // console.error('Error fetching daily performance summary:', error);
            return null;
        }
    },

    // Client-side methods for real-time updates
    /**
     * Get dashboard overview (client-side)
     */
    async getDashboardOverviewClient(query?: DashboardQuery) {
        try {
            const response = await axiosClient.get(`${baseUrl}/Dashboard/GetOverview`, {
                params: query
            });

            if (response.status >= 400) {
                return null;
            }

            return response.data as IResponse<DashboardOverviewViewModel> || null;
        } catch (error) {
            // console.error('Error fetching dashboard overview (client):', error);
            return null;
        }
    },

    /**
     * Get quick stats (client-side)
     */
    async getQuickStatsClient(unitId?: string) {
        try {
            const response = await axiosClient.get(`${baseUrl}/Dashboard/GetQuickStats`, {
                params: unitId ? { unitId } : undefined
            });

            if (response.status >= 400) {
                return null;
            }

            return response.data as IResponse<QuickStatsViewModel> || null;
        } catch (error) {
            // console.error('Error fetching quick stats (client):', error);
            return null;
        }
    },

    /**
     * Get unread count (client-side)
     */
    async getUnreadCountClient(unitId?: string) {
        try {
            const response = await axiosClient.get(`${baseUrl}/Dashboard/GetUnreadCount`, {
                params: unitId ? { unitId } : undefined
            });

            if (response.status >= 400) {
                return null;
            }

            return response.data as IResponse<number> || null;
        } catch (error) {
            // console.error('Error fetching unread count (client):', error);
            return null;
        }
    },

    /**
     * Get daily performance summary (client-side)
     */
    async getDailyPerformanceSummaryClient(query?: DailyPerformanceQuery) {
        try {
            const response = await axiosClient.get(`${baseUrl}/Dashboard/GetDailyPerformanceSummary`, {
                params: query
            });

            if (response.status >= 400) {
                return null;
            }

            return response.data as IResponse<DailyPerformanceSummaryViewModel> || null;
        } catch (error) {
            // console.error('Error fetching daily performance summary (client):', error);
            return null;
        }
    }
}; 