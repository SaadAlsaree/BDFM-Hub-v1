export interface CorrespondenceDashboardSummary {
  unreadIncomingMailCount: number;
  totalActiveCorrespondence: number;
  totalCorrespondence: number;
  averageMonthlyVolume: number;
  correspondenceTypeDistribution: TypeDistributionEntry[];
  topUnitsReceivingCorrespondence: TopUnitEntry[];
  automationPerformance: AutomationPerformance;
  correspondenceStatusDistribution: StatusDistributionEntry[];
  backlogMetrics: BacklogMetrics;
  generatedAt: string; // ISO date string
  filteredByUnitId: string;
  filteredByUnitName: string;
}

export interface TypeDistributionEntry {
  correspondenceType: number;
  typeName: string;
  count: number;
  percentage: number;
}

export interface TopUnitEntry {
  unitId: string;
  unitName: string;
  unitCode: string;
  correspondenceCount: number;
  incomingCount: number;
  outgoingCount: number;
  internalCount: number;
}

export interface AutomationPerformance {
  successRate: number;
  averageExecutionTimeMinutes: number;
  totalAutomatedProcesses: number;
  successfulProcesses: number;
  failedProcesses: number;
  byAutomationType: AutomationTypeEntry[];
}

export interface AutomationTypeEntry {
  automationType: string;
  successRate: number;
  averageExecutionTimeMinutes: number;
  totalProcesses: number;
}

export interface StatusDistributionEntry {
  status: number;
  statusName: string;
  count: number;
  percentage: number;
}

export interface BacklogMetrics {
  totalBackloggedTasks: number;
  overdueTasks: number;
  tasksDueToday: number;
  tasksDueThisWeek: number;
  averageTaskAge: number;
  byUnit: BacklogUnitEntry[];
}

export interface BacklogUnitEntry {
  unitId: string;
  unitName: string;
  backloggedTasks: number;
  overdueTasks: number;
}

export interface OverviewQuery {
  unitId?: string;
  startDate?: string;
  endDate?: string;
  monthsBack?: number;
}

// Daily Performance Summary Types
export interface DailyPerformanceSummaryViewModel {
  date: string; // ISO date string
  dateDisplay: string; // Arabic formatted date
  todaysProcessingCorrespondence: number;
  completionRate: number;
  averageProcessingTimeHours: number;
  activeUnitsCount: number;
  activeUnits: DailyUnitPerformance[];
  breakdown: DailyBreakdown;
  generatedAt: string; // ISO date string
  filteredByUnitId?: string;
  filteredByUnitName?: string;
}

export interface DailyUnitPerformance {
  unitId: string;
  unitName: string;
  unitCode: string;
  processingCount: number;
  completedCount: number;
  completionRate: number;
  averageProcessingTimeHours: number;
  activeTasksCount: number;
  performanceStatus: 'ممتاز' | 'جيد' | 'متوسط' | 'ضعيف';
}

export interface DailyBreakdown {
  incomingCorrespondence: number;
  outgoingCorrespondence: number;
  internalCorrespondence: number;
  completedToday: number;
  startedToday: number;
  overdueCompleted: number;
  onTimeCompleted: number;
  velocity: VelocityMetrics;
}

export interface VelocityMetrics {
  itemsPerHour: number;
  itemsPerDay: number;
  trendDirection: 'Up' | 'Down' | 'Stable';
  trendPercentage: number;
  peakProcessingTime: string; // HH:mm:ss format
}

export interface DailyPerformanceQuery {
  unitId?: string;
  date?: string; // ISO date string
}
