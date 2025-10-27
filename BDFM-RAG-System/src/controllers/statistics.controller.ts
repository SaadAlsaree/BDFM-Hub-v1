import { Request, Response } from 'express';
import statisticsService from '../services/statistics.service';
import logger from '../utils/logger';
import { StatisticsFilters } from '../models';

/**
 * Statistics Controller
 * Handles statistics and reports endpoints
 */
export class StatisticsController {
  /**
   * Get correspondence statistics overview
   * GET /statistics/correspondences/overview
   */
  async getCorrespondenceOverview(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const filters: StatisticsFilters = {
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        correspondenceType: req.query.correspondenceType
          ? (req.query.correspondenceType as string).split(',')
          : undefined,
        priorityLevel: req.query.priorityLevel
          ? (req.query.priorityLevel as string).split(',')
          : undefined,
        secrecyLevel: req.query.secrecyLevel
          ? (req.query.secrecyLevel as string).split(',')
          : undefined,
        userId: req.query.userId as string,
        includeDeleted: req.query.includeDeleted === 'true',
      };

      logger.info('Getting correspondence statistics overview');

      const stats =
        await statisticsService.getCorrespondenceStatistics(filters);

      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error in getCorrespondenceOverview:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to get correspondence statistics',
          code: 'STATISTICS_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get correspondence time series data
   * GET /statistics/correspondences/time-series
   */
  async getCorrespondenceTimeSeries(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const period = (req.query.period as string) || 'month';

      if (!['day', 'week', 'month', 'year'].includes(period)) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid period. Must be: day, week, month, or year',
            code: 'INVALID_PERIOD',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const filters: StatisticsFilters = {
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        correspondenceType: req.query.correspondenceType
          ? (req.query.correspondenceType as string).split(',')
          : undefined,
        priorityLevel: req.query.priorityLevel
          ? (req.query.priorityLevel as string).split(',')
          : undefined,
        userId: req.query.userId as string,
        includeDeleted: req.query.includeDeleted === 'true',
      };

      logger.info(`Getting correspondence time series for period: ${period}`);

      const timeSeries =
        await statisticsService.getCorrespondenceTimeSeries(
          period as 'day' | 'week' | 'month' | 'year',
          filters
        );

      res.json({
        success: true,
        data: timeSeries,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error in getCorrespondenceTimeSeries:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to get time series data',
          code: 'STATISTICS_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get workflow statistics overview
   * GET /statistics/workflow/overview
   */
  async getWorkflowOverview(req: Request, res: Response): Promise<void> {
    try {
      const filters: StatisticsFilters = {
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        status: req.query.status
          ? (req.query.status as string).split(',')
          : undefined,
        userId: req.query.userId as string,
        includeDeleted: req.query.includeDeleted === 'true',
      };

      logger.info('Getting workflow statistics overview');

      const stats = await statisticsService.getWorkflowStatistics(filters);

      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error in getWorkflowOverview:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to get workflow statistics',
          code: 'STATISTICS_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get workflow tracking for a correspondence
   * GET /statistics/workflow/tracking/:correspondenceId
   */
  async getWorkflowTracking(req: Request, res: Response): Promise<void> {
    try {
      const { correspondenceId } = req.params;

      if (!correspondenceId) {
        res.status(400).json({
          success: false,
          error: {
            message: 'correspondenceId is required',
            code: 'MISSING_ID',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info(
        `Getting workflow tracking for correspondence: ${correspondenceId}`
      );

      const tracking =
        await statisticsService.getWorkflowTracking(correspondenceId);

      if (!tracking) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Correspondence not found',
            code: 'NOT_FOUND',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        success: true,
        data: tracking,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error in getWorkflowTracking:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to get workflow tracking',
          code: 'STATISTICS_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get overdue workflow steps
   * GET /statistics/workflow/overdue
   */
  async getOverdueWorkflowSteps(req: Request, res: Response): Promise<void> {
    try {
      const filters: StatisticsFilters = {
        userId: req.query.userId as string,
      };

      logger.info('Getting overdue workflow steps');

      const overdueSteps =
        await statisticsService.getOverdueWorkflowSteps(filters);

      res.json({
        success: true,
        data: overdueSteps,
        count: overdueSteps.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error in getOverdueWorkflowSteps:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to get overdue workflow steps',
          code: 'STATISTICS_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get performance report
   * GET /statistics/reports/performance
   */
  async getPerformanceReport(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: {
            message: 'startDate and endDate are required',
            code: 'MISSING_DATES',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const filters: StatisticsFilters = {
        userId: req.query.userId as string,
        includeDeleted: req.query.includeDeleted === 'true',
      };

      logger.info(
        `Getting performance report from ${startDate} to ${endDate}`
      );

      const report = await statisticsService.getPerformanceReport(
        startDate as string,
        endDate as string,
        filters
      );

      res.json({
        success: true,
        data: report,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error in getPerformanceReport:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to generate performance report',
          code: 'STATISTICS_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get user productivity statistics
   * GET /statistics/users/:userId/productivity
   */
  async getUserProductivity(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: {
            message: 'userId is required',
            code: 'MISSING_USER_ID',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: {
            message: 'startDate and endDate are required',
            code: 'MISSING_DATES',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info(
        `Getting productivity stats for user ${userId} from ${startDate} to ${endDate}`
      );

      const stats = await statisticsService.getUserProductivityStats(
        userId,
        startDate as string,
        endDate as string
      );

      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error in getUserProductivity:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to get user productivity stats',
          code: 'STATISTICS_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Clear statistics cache
   * POST /statistics/cache/clear
   */
  async clearCache(req: Request, res: Response): Promise<void> {
    try {
      statisticsService.clearCache();

      res.json({
        success: true,
        data: {
          message: 'Statistics cache cleared successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error in clearCache:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to clear cache',
          code: 'CACHE_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export default new StatisticsController();
