import { Pool, PoolClient } from 'pg';
import config from '../config';
import logger from '../utils/logger';
import { Correspondence, WorkflowStep } from '../models';

export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: config.postgres.host,
      port: config.postgres.port,
      database: config.postgres.database,
      user: config.postgres.user,
      password: config.postgres.password,
      max: config.postgres.max,
      idleTimeoutMillis: config.postgres.idleTimeoutMillis,
      connectionTimeoutMillis: config.postgres.connectionTimeoutMillis,
    });

    // Handle pool errors
    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle client:', err);
    });
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      logger.info('Database connection successful');
      return true;
    } catch (error) {
      logger.error('Database connection failed:', error);
      return false;
    }
  }

  /**
   * Get all correspondences (with pagination)
   */
  async getAllCorrespondences(
    limit: number = 1000,
    offset: number = 0
  ): Promise<Correspondence[]> {
    try {
      const query = `
        SELECT
          "Id" as id,
          "MailNum" as "mailNum",
          "MailDate" as "mailDate",
          "Subject" as subject,
          "BodyText" as "bodyText",
          "CorrespondenceType" as "correspondenceType",
          "SecrecyLevel" as "secrecyLevel",
          "PriorityLevel" as "priorityLevel",
          "PersonalityLevel" as "personalityLevel",
          "ExternalReferenceNumber" as "externalReferenceNumber",
          "ExternalReferenceDate" as "externalReferenceDate",
          "IsDraft" as "isDraft",
          "HasAttachments" as "hasAttachments",
          "AttachmentCount" as "attachmentCount",
          "CreateByUserId" as "createByUserId",
          "SignatoryUserId" as "signatoryUserId",
          "ExternalEntityId" as "externalEntityId",
          "FileId" as "fileId",
          "CreateAt" as "createdAt",
          "LastUpdateAt" as "lastUpdatedAt",
          "IsDeleted" as "isDeleted"
        FROM "Correspondences"
        WHERE "IsDeleted" = false
        ORDER BY "CreateAt" DESC
        LIMIT $1 OFFSET $2
      `;

      const result = await this.pool.query(query, [limit, offset]);
      return result.rows as Correspondence[];
    } catch (error) {
      logger.error('Error fetching correspondences:', error);
      throw error;
    }
  }

  /**
   * Get correspondence by ID
   */
  async getCorrespondenceById(id: string): Promise<Correspondence | null> {
    try {
      const query = `
        SELECT
          "Id" as id,
          "MailNum" as "mailNum",
          "MailDate" as "mailDate",
          "Subject" as subject,
          "BodyText" as "bodyText",
          "CorrespondenceType" as "correspondenceType",
          "SecrecyLevel" as "secrecyLevel",
          "PriorityLevel" as "priorityLevel",
          "PersonalityLevel" as "personalityLevel",
          "ExternalReferenceNumber" as "externalReferenceNumber",
          "ExternalReferenceDate" as "externalReferenceDate",
          "IsDraft" as "isDraft",
          "HasAttachments" as "hasAttachments",
          "AttachmentCount" as "attachmentCount",
          "CreateByUserId" as "createByUserId",
          "SignatoryUserId" as "signatoryUserId",
          "ExternalEntityId" as "externalEntityId",
          "FileId" as "fileId",
          "CreateAt" as "createdAt",
          "LastUpdateAt" as "lastUpdatedAt",
          "IsDeleted" as "isDeleted"
        FROM "Correspondences"
        WHERE "Id" = $1 AND "IsDeleted" = false
      `;

      const result = await this.pool.query(query, [id]);
      return result.rows.length > 0 ? (result.rows[0] as Correspondence) : null;
    } catch (error) {
      logger.error(`Error fetching correspondence ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get correspondences created/updated after a specific date
   */
  async getCorrespondencesSince(sinceDate: Date): Promise<Correspondence[]> {
    try {
      const query = `
        SELECT
          "Id" as id,
          "MailNum" as "mailNum",
          "MailDate" as "mailDate",
          "Subject" as subject,
          "BodyText" as "bodyText",
          "CorrespondenceType" as "correspondenceType",
          "SecrecyLevel" as "secrecyLevel",
          "PriorityLevel" as "priorityLevel",
          "PersonalityLevel" as "personalityLevel",
          "ExternalReferenceNumber" as "externalReferenceNumber",
          "ExternalReferenceDate" as "externalReferenceDate",
          "IsDraft" as "isDraft",
          "HasAttachments" as "hasAttachments",
          "AttachmentCount" as "attachmentCount",
          "CreateByUserId" as "createByUserId",
          "SignatoryUserId" as "signatoryUserId",
          "ExternalEntityId" as "externalEntityId",
          "FileId" as "fileId",
          "CreateAt" as "createdAt",
          "LastUpdateAt" as "lastUpdatedAt",
          "IsDeleted" as "isDeleted"
        FROM "Correspondences"
        WHERE "IsDeleted" = false
          AND ("CreateAt" >= $1 OR "LastUpdateAt" >= $1)
        ORDER BY "CreateAt" DESC
      `;

      const result = await this.pool.query(query, [sinceDate]);
      return result.rows as Correspondence[];
    } catch (error) {
      logger.error('Error fetching correspondences since date:', error);
      throw error;
    }
  }

  /**
   * Get total count of correspondences
   */
  async getCorrespondenceCount(): Promise<number> {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM "Correspondences"
        WHERE "IsDeleted" = false
      `;

      const result = await this.pool.query(query);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      logger.error('Error counting correspondences:', error);
      return 0;
    }
  }

  /**
   * Get workflow steps for a correspondence
   */
  async getWorkflowStepsByCorrespondenceId(
    correspondenceId: string
  ): Promise<WorkflowStep[]> {
    try {
      const query = `
        SELECT
          "Id" as id,
          "CorrespondenceId" as "correspondenceId",
          "FromUserId" as "fromUserId",
          "FromUnitId" as "fromUnitId",
          "ActionType" as "actionType",
          "InstructionText" as "instructionText",
          "ToPrimaryRecipientType" as "toPrimaryRecipientType",
          "ToPrimaryRecipientId" as "toPrimaryRecipientId",
          "DueDate" as "dueDate",
          "Status" as status,
          "IsTimeSensitive" as "isTimeSensitive",
          "CreateAt" as "createdAt",
          "IsDeleted" as "isDeleted"
        FROM "WorkflowSteps"
        WHERE "CorrespondenceId" = $1 AND "IsDeleted" = false
        ORDER BY "CreateAt" ASC
      `;

      const result = await this.pool.query(query, [correspondenceId]);
      return result.rows as WorkflowStep[];
    } catch (error) {
      logger.error(
        `Error fetching workflow steps for correspondence ${correspondenceId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Close database connection pool
   */
  async close(): Promise<void> {
    await this.pool.end();
    logger.info('Database pool closed');
  }

  /**
   * Execute a raw query
   */
  async query(text: string, params?: any[]): Promise<any> {
    try {
      return await this.pool.query(text, params);
    } catch (error) {
      logger.error('Error executing query:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new DatabaseService();
