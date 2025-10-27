import { Pool } from 'pg';
import config from '../config';
import logger from '../utils/logger';
import databaseService from './database.service';
import {
  StatisticsFilters,
  CorrespondenceStatistics,
  WorkflowStatistics,
  CorrespondenceTimeSeriesStats,
  TimeSeriesData,
  WorkflowTrackingData,
  PerformanceReport,
  UserProductivityStats,
} from '../models';

/**
 * Statistics Service for generating reports and analytics
 */
export class StatisticsService {
  private pool: Pool;
  private cache: Map<string, { data: any; timestamp: number }>;
  private cacheTTL: number;
  private cacheEnabled: boolean;

  constructor(pool: Pool) {
    this.pool = pool;
    this.cache = new Map();
    this.cacheTTL = config.statistics.cacheTTL * 1000; // Convert to milliseconds
    this.cacheEnabled = config.statistics.cacheEnabled;
  }

  /**
   * Get data from cache or execute query
   */
  private async getCached<T>(
    key: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    if (!this.cacheEnabled) {
      return await queryFn();
    }

    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      logger.debug(`Cache hit for key: ${key}`);
      return cached.data as T;
    }

    logger.debug(`Cache miss for key: ${key}`);
    const data = await queryFn();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('Statistics cache cleared');
  }

  /**
   * Build WHERE clause from filters
   */
  private buildWhereClause(
    filters: StatisticsFilters,
    paramOffset: number = 1
  ): { clause: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = paramOffset;

    if (!filters.includeDeleted) {
      conditions.push(`"IsDeleted" = false`);
    }

    if (filters.dateFrom) {
      conditions.push(`"CreateAt" >= $${paramIndex}`);
      params.push(new Date(filters.dateFrom));
      paramIndex++;
    }

    if (filters.dateTo) {
      conditions.push(`"CreateAt" <= $${paramIndex}`);
      params.push(new Date(filters.dateTo));
      paramIndex++;
    }

    if (filters.correspondenceType && filters.correspondenceType.length > 0) {
      conditions.push(`"CorrespondenceType" = ANY($${paramIndex})`);
      params.push(filters.correspondenceType);
      paramIndex++;
    }

    if (filters.priorityLevel && filters.priorityLevel.length > 0) {
      conditions.push(`"PriorityLevel" = ANY($${paramIndex})`);
      params.push(filters.priorityLevel);
      paramIndex++;
    }

    if (filters.secrecyLevel && filters.secrecyLevel.length > 0) {
      conditions.push(`"SecrecyLevel" = ANY($${paramIndex})`);
      params.push(filters.secrecyLevel);
      paramIndex++;
    }

    if (filters.userId) {
      conditions.push(
        `("CreateByUserId" = $${paramIndex} OR "SignatoryUserId" = $${paramIndex})`
      );
      params.push(filters.userId);
      paramIndex++;
    }

    const clause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { clause, params };
  }

  /**
   * Get correspondence statistics overview
   */
  async getCorrespondenceStatistics(
    filters: StatisticsFilters = {}
  ): Promise<CorrespondenceStatistics> {
    const cacheKey = `corr_stats_${JSON.stringify(filters)}`;

    return await this.getCached(cacheKey, async () => {
      try {
        const { clause, params } = this.buildWhereClause(filters);

        // Total count
        const totalQuery = `SELECT COUNT(*) as count FROM "Correspondences" ${clause}`;
        const totalResult = await this.pool.query(totalQuery, params);
        const total = parseInt(totalResult.rows[0].count, 10);

        // By Type
        const typeQuery = `
          SELECT "CorrespondenceType", COUNT(*) as count
          FROM "Correspondences" ${clause}
          GROUP BY "CorrespondenceType"
        `;
        const typeResult = await this.pool.query(typeQuery, params);
        const byType: Record<string, number> = {};
        typeResult.rows.forEach((row) => {
          byType[row.CorrespondenceType] = parseInt(row.count, 10);
        });

        // By Priority
        const priorityQuery = `
          SELECT "PriorityLevel", COUNT(*) as count
          FROM "Correspondences" ${clause}
          GROUP BY "PriorityLevel"
        `;
        const priorityResult = await this.pool.query(priorityQuery, params);
        const byPriority: Record<string, number> = {};
        priorityResult.rows.forEach((row) => {
          byPriority[row.PriorityLevel] = parseInt(row.count, 10);
        });

        // By Secrecy
        const secrecyQuery = `
          SELECT "SecrecyLevel", COUNT(*) as count
          FROM "Correspondences" ${clause}
          GROUP BY "SecrecyLevel"
        `;
        const secrecyResult = await this.pool.query(secrecyQuery, params);
        const bySecrecy: Record<string, number> = {};
        secrecyResult.rows.forEach((row) => {
          bySecrecy[row.SecrecyLevel] = parseInt(row.count, 10);
        });

        // With attachments
        const attachmentQuery = `
          SELECT COUNT(*) as count
          FROM "Correspondences"
          ${clause ? clause + ' AND' : 'WHERE'} "HasAttachments" = true
        `;
        const attachmentResult = await this.pool.query(attachmentQuery, params);
        const withAttachments = parseInt(attachmentResult.rows[0].count, 10);

        // Drafts
        const draftQuery = `
          SELECT COUNT(*) as count
          FROM "Correspondences"
          ${clause ? clause + ' AND' : 'WHERE'} "IsDraft" = true
        `;
        const draftResult = await this.pool.query(draftQuery, params);
        const drafts = parseInt(draftResult.rows[0].count, 10);

        return {
          total,
          byType,
          byPriority,
          bySecrecy,
          byStatus: {}, // Would need status field in DB
          withAttachments,
          drafts,
        };
      } catch (error) {
        logger.error('Error getting correspondence statistics:', error);
        throw error;
      }
    });
  }

  /**
   * Get workflow statistics
   */
  async getWorkflowStatistics(
    filters: StatisticsFilters = {}
  ): Promise<WorkflowStatistics> {
    const cacheKey = `workflow_stats_${JSON.stringify(filters)}`;

    return await this.getCached(cacheKey, async () => {
      try {
        const conditions: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        if (!filters.includeDeleted) {
          conditions.push(`"IsDeleted" = false`);
        }

        if (filters.dateFrom) {
          conditions.push(`"CreateAt" >= $${paramIndex}`);
          params.push(new Date(filters.dateFrom));
          paramIndex++;
        }

        if (filters.dateTo) {
          conditions.push(`"CreateAt" <= $${paramIndex}`);
          params.push(new Date(filters.dateTo));
          paramIndex++;
        }

        if (filters.status && filters.status.length > 0) {
          conditions.push(`"Status" = ANY($${paramIndex})`);
          params.push(filters.status);
          paramIndex++;
        }

        if (filters.userId) {
          conditions.push(
            `("FromUserId" = $${paramIndex} OR "ToPrimaryRecipientId" = $${paramIndex})`
          );
          params.push(filters.userId);
          paramIndex++;
        }

        const whereClause =
          conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Total count
        const totalQuery = `SELECT COUNT(*) as count FROM "WorkflowSteps" ${whereClause}`;
        const totalResult = await this.pool.query(totalQuery, params);
        const total = parseInt(totalResult.rows[0].count, 10);

        // By Status
        const statusQuery = `
          SELECT "Status", COUNT(*) as count
          FROM "WorkflowSteps" ${whereClause}
          GROUP BY "Status"
        `;
        const statusResult = await this.pool.query(statusQuery, params);
        const byStatus: Record<string, number> = {};
        statusResult.rows.forEach((row) => {
          byStatus[row.Status] = parseInt(row.count, 10);
        });

        // By Action
        const actionQuery = `
          SELECT "ActionType", COUNT(*) as count
          FROM "WorkflowSteps" ${whereClause}
          GROUP BY "ActionType"
        `;
        const actionResult = await this.pool.query(actionQuery, params);
        const byAction: Record<string, number> = {};
        actionResult.rows.forEach((row) => {
          byAction[row.ActionType] = parseInt(row.count, 10);
        });

        // Overdue
        const overdueQuery = `
          SELECT COUNT(*) as count
          FROM "WorkflowSteps"
          ${whereClause ? whereClause + ' AND' : 'WHERE'}
          "DueDate" < NOW() AND "Status" != 'Completed'
        `;
        const overdueResult = await this.pool.query(overdueQuery, params);
        const overdue = parseInt(overdueResult.rows[0].count, 10);

        // Time sensitive
        const sensitiveQuery = `
          SELECT COUNT(*) as count
          FROM "WorkflowSteps"
          ${whereClause ? whereClause + ' AND' : 'WHERE'}
          "IsTimeSensitive" = true
        `;
        const sensitiveResult = await this.pool.query(sensitiveQuery, params);
        const timeSensitive = parseInt(sensitiveResult.rows[0].count, 10);

        // Completion rate
        const completed = byStatus['Completed'] || 0;
        const completionRate = total > 0 ? (completed / total) * 100 : 0;

        return {
          total,
          byStatus,
          byAction,
          overdue,
          timeSensitive,
          completionRate: Math.round(completionRate * 100) / 100,
        };
      } catch (error) {
        logger.error('Error getting workflow statistics:', error);
        throw error;
      }
    });
  }

  /**
   * Get time series data for correspondences
   */
  async getCorrespondenceTimeSeries(
    period: 'day' | 'week' | 'month' | 'year',
    filters: StatisticsFilters = {}
  ): Promise<CorrespondenceTimeSeriesStats> {
    const cacheKey = `corr_timeseries_${period}_${JSON.stringify(filters)}`;

    return await this.getCached(cacheKey, async () => {
      try {
        const { clause, params } = this.buildWhereClause(filters);

        const dateFormat: Record<string, string> = {
          day: 'YYYY-MM-DD',
          week: 'IYYY-IW',
          month: 'YYYY-MM',
          year: 'YYYY',
        };

        const query = `
          SELECT
            TO_CHAR("CreateAt", '${dateFormat[period]}') as date,
            COUNT(*) as count
          FROM "Correspondences" ${clause}
          GROUP BY date
          ORDER BY date DESC
          LIMIT 50
        `;

        const result = await this.pool.query(query, params);

        const data: TimeSeriesData[] = result.rows.map((row) => ({
          date: row.date,
          count: parseInt(row.count, 10),
        }));

        const total = data.reduce((sum, item) => sum + item.count, 0);
        const average = data.length > 0 ? total / data.length : 0;

        // Calculate trend
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (data.length >= 2) {
          const recent = data.slice(0, Math.ceil(data.length / 3));
          const older = data.slice(-Math.ceil(data.length / 3));
          const recentAvg =
            recent.reduce((sum, item) => sum + item.count, 0) / recent.length;
          const olderAvg =
            older.reduce((sum, item) => sum + item.count, 0) / older.length;

          if (recentAvg > olderAvg * 1.1) trend = 'up';
          else if (recentAvg < olderAvg * 0.9) trend = 'down';
        }

        return {
          period,
          data: data.reverse(),
          total,
          average: Math.round(average * 100) / 100,
          trend,
        };
      } catch (error) {
        logger.error('Error getting time series data:', error);
        throw error;
      }
    });
  }

  /**
   * Get workflow tracking for a correspondence
   */
  async getWorkflowTracking(
    correspondenceId: string
  ): Promise<WorkflowTrackingData | null> {
    try {
      // Get correspondence
      const corrQuery = `
        SELECT
          "Id" as id,
          "MailNum" as "mailNum",
          "MailDate" as "mailDate",
          "Subject" as subject,
          "CorrespondenceType" as "correspondenceType",
          "PriorityLevel" as "priorityLevel"
        FROM "Correspondences"
        WHERE "Id" = $1
      `;
      const corrResult = await this.pool.query(corrQuery, [correspondenceId]);

      if (corrResult.rows.length === 0) {
        return null;
      }

      const correspondence = corrResult.rows[0];

      // Get workflow steps
      const stepsQuery = `
        SELECT
          "Id" as id,
          "ActionType" as "actionType",
          "Status" as status,
          "FromUserId" as "fromUserId",
          "ToPrimaryRecipientId" as "toPrimaryRecipientId",
          "CreateAt" as "createdAt",
          "DueDate" as "dueDate"
        FROM "WorkflowSteps"
        WHERE "CorrespondenceId" = $1 AND "IsDeleted" = false
        ORDER BY "CreateAt" ASC
      `;
      const stepsResult = await this.pool.query(stepsQuery, [correspondenceId]);

      const now = new Date();
      const steps = stepsResult.rows.map((row) => {
        const isOverdue = row.dueDate && new Date(row.dueDate) < now && row.status !== 'Completed';
        return {
          id: row.id,
          actionType: row.actionType,
          status: row.status,
          fromUserId: row.fromUserId,
          toPrimaryRecipientId: row.toPrimaryRecipientId,
          createdAt: row.createdAt,
          dueDate: row.dueDate,
          isOverdue: !!isOverdue,
        };
      });

      const totalSteps = steps.length;
      const completedSteps = steps.filter((s) => s.status === 'Completed').length;
      const progressPercentage =
        totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

      // Determine current status
      const lastStep = steps[steps.length - 1];
      const currentStatus = lastStep ? lastStep.status : 'NotStarted';

      return {
        correspondenceId,
        correspondence: {
          mailNum: correspondence.mailNum,
          mailDate: correspondence.mailDate,
          subject: correspondence.subject,
          correspondenceType: correspondence.correspondenceType,
          priorityLevel: correspondence.priorityLevel,
        },
        steps,
        currentStatus,
        totalSteps,
        completedSteps,
        progressPercentage: Math.round(progressPercentage * 100) / 100,
      };
    } catch (error) {
      logger.error('Error getting workflow tracking:', error);
      throw error;
    }
  }

  /**
   * Get performance report
   */
  async getPerformanceReport(
    startDate: string,
    endDate: string,
    filters: StatisticsFilters = {}
  ): Promise<PerformanceReport> {
    const cacheKey = `perf_report_${startDate}_${endDate}_${JSON.stringify(filters)}`;

    return await this.getCached(cacheKey, async () => {
      try {
        filters.dateFrom = startDate;
        filters.dateTo = endDate;

        const corrStats = await this.getCorrespondenceStatistics(filters);
        const workflowStats = await this.getWorkflowStatistics(filters);

        // Get created correspondences in period
        const { clause, params } = this.buildWhereClause(filters);
        const createdQuery = `
          SELECT COUNT(*) as count
          FROM "Correspondences"
          ${clause}
        `;
        const createdResult = await this.pool.query(createdQuery, params);
        const created = parseInt(createdResult.rows[0].count, 10);

        return {
          period: {
            from: startDate,
            to: endDate,
          },
          correspondences: {
            total: corrStats.total,
            created,
            completed: 0, // Would need status tracking
            pending: corrStats.drafts,
          },
          workflows: {
            totalSteps: workflowStats.total,
            completedSteps: workflowStats.byStatus['Completed'] || 0,
            pendingSteps: workflowStats.byStatus['Pending'] || 0,
            overdueSteps: workflowStats.overdue,
            completionRate: workflowStats.completionRate,
          },
        };
      } catch (error) {
        logger.error('Error generating performance report:', error);
        throw error;
      }
    });
  }

  /**
   * Get user productivity statistics
   */
  async getUserProductivityStats(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<UserProductivityStats> {
    try {
      // Correspondences created
      const createdQuery = `
        SELECT COUNT(*) as count
        FROM "Correspondences"
        WHERE "CreateByUserId" = $1
          AND "CreateAt" >= $2
          AND "CreateAt" <= $3
          AND "IsDeleted" = false
      `;
      const createdResult = await this.pool.query(createdQuery, [
        userId,
        new Date(startDate),
        new Date(endDate),
      ]);
      const correspondencesCreated = parseInt(createdResult.rows[0].count, 10);

      // Correspondences signed
      const signedQuery = `
        SELECT COUNT(*) as count
        FROM "Correspondences"
        WHERE "SignatoryUserId" = $1
          AND "CreateAt" >= $2
          AND "CreateAt" <= $3
          AND "IsDeleted" = false
      `;
      const signedResult = await this.pool.query(signedQuery, [
        userId,
        new Date(startDate),
        new Date(endDate),
      ]);
      const correspondencesSigned = parseInt(signedResult.rows[0].count, 10);

      // Workflow steps completed
      const completedQuery = `
        SELECT COUNT(*) as count
        FROM "WorkflowSteps"
        WHERE "ToPrimaryRecipientId" = $1
          AND "Status" = 'Completed'
          AND "CreateAt" >= $2
          AND "CreateAt" <= $3
          AND "IsDeleted" = false
      `;
      const completedResult = await this.pool.query(completedQuery, [
        userId,
        new Date(startDate),
        new Date(endDate),
      ]);
      const workflowStepsCompleted = parseInt(completedResult.rows[0].count, 10);

      // Workflow steps pending
      const pendingQuery = `
        SELECT COUNT(*) as count
        FROM "WorkflowSteps"
        WHERE "ToPrimaryRecipientId" = $1
          AND "Status" IN ('Pending', 'InProgress')
          AND "CreateAt" >= $2
          AND "CreateAt" <= $3
          AND "IsDeleted" = false
      `;
      const pendingResult = await this.pool.query(pendingQuery, [
        userId,
        new Date(startDate),
        new Date(endDate),
      ]);
      const workflowStepsPending = parseInt(pendingResult.rows[0].count, 10);

      // Overdue count
      const overdueQuery = `
        SELECT COUNT(*) as count
        FROM "WorkflowSteps"
        WHERE "ToPrimaryRecipientId" = $1
          AND "DueDate" < NOW()
          AND "Status" != 'Completed'
          AND "CreateAt" >= $2
          AND "CreateAt" <= $3
          AND "IsDeleted" = false
      `;
      const overdueResult = await this.pool.query(overdueQuery, [
        userId,
        new Date(startDate),
        new Date(endDate),
      ]);
      const overdueCount = parseInt(overdueResult.rows[0].count, 10);

      const totalSteps = workflowStepsCompleted + workflowStepsPending;
      const completionRate =
        totalSteps > 0 ? (workflowStepsCompleted / totalSteps) * 100 : 0;

      return {
        userId,
        period: {
          from: startDate,
          to: endDate,
        },
        correspondencesCreated,
        correspondencesSigned,
        workflowStepsCompleted,
        workflowStepsPending,
        completionRate: Math.round(completionRate * 100) / 100,
        overdueCount,
      };
    } catch (error) {
      logger.error('Error getting user productivity stats:', error);
      throw error;
    }
  }

  /**
   * Get overdue workflow steps
   */
  async getOverdueWorkflowSteps(filters: StatisticsFilters = {}): Promise<any[]> {
    try {
      const conditions: string[] = [
        '"IsDeleted" = false',
        '"DueDate" < NOW()',
        '"Status" != \'Completed\'',
      ];
      const params: any[] = [];
      let paramIndex = 1;

      if (filters.userId) {
        conditions.push(
          `("FromUserId" = $${paramIndex} OR "ToPrimaryRecipientId" = $${paramIndex})`
        );
        params.push(filters.userId);
        paramIndex++;
      }

      const whereClause = `WHERE ${conditions.join(' AND ')}`;

      const query = `
        SELECT
          ws."Id" as id,
          ws."CorrespondenceId" as "correspondenceId",
          ws."ActionType" as "actionType",
          ws."Status" as status,
          ws."DueDate" as "dueDate",
          ws."ToPrimaryRecipientId" as "toPrimaryRecipientId",
          c."MailNum" as "mailNum",
          c."Subject" as subject,
          c."PriorityLevel" as "priorityLevel"
        FROM "WorkflowSteps" ws
        JOIN "Correspondences" c ON ws."CorrespondenceId" = c."Id"
        ${whereClause}
        ORDER BY ws."DueDate" ASC
        LIMIT 100
      `;

      const result = await this.pool.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error getting overdue workflow steps:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new StatisticsService(databaseService['pool']);
