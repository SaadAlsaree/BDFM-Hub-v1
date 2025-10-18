export interface AutomationTypeStats {
  automationType: string;
  successRate: number;
  averageExecutionTimeMinutes: number;
  totalProcesses: number;
}

export interface AutomationPerformance {
  successRate: number;
  averageExecutionTimeMinutes: number;
  totalAutomatedProcesses: number;
  successfulProcesses: number;
  failedProcesses: number;
  byAutomationType: AutomationTypeStats[];
}

export interface AutomationPerformanceQuery {
  unitId?: string;
  startDate?: string;
  endDate?: string;
}
