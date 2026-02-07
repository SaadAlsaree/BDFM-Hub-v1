import { IResponse } from '@/types/response';

export interface UnitWorkflowStepsStatistics {
  unitId: string;
  unitName: string;
  unitCode: string;
  unitType: number;
  unitTypeName: string;
  totalWorkflowSteps: number;
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
  rejectedCount: number;
  delegatedCount: number;
  returnedCount: number;
  delayedCount: number;
}

export interface WorkflowStepsStatisticsData {
  units: UnitWorkflowStepsStatistics[];
}

export type WorkflowStepsStatisticsResponse =
  IResponse<WorkflowStepsStatisticsData>;

export interface WorkflowStepsStatisticsQuery {
  unitId?: string; // GUID as string
  includeSubUnits?: boolean; // default true
  startDate?: string; // DateOnly ISO string e.g., '2025-07-29'
  endDate?: string; // DateOnly ISO string
}

export const defaultWorkflowStepsStatisticsQuery: WorkflowStepsStatisticsQuery =
  {
    unitId: undefined,
    includeSubUnits: true,
    startDate: undefined,
    endDate: undefined
  };

export interface IDelayedStepsReportQuery {
  organizationalUnitId?: string;
  includeUsers?: boolean;
  includeUnits?: boolean;
}

export const defaultDelayedStepsReportQuery: IDelayedStepsReportQuery = {
  organizationalUnitId: undefined,
  includeUsers: true,
  includeUnits: true
};
