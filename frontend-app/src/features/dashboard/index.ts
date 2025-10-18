// Components
export {
  DashboardOverview,
  DashboardOverviewSkeleton
} from './components/dashboard-overview';
export { DashboardStatsCards } from './components/dashboard-stats-cards';
export { CorrespondenceTypeChart } from './components/correspondence-type-chart';
export { TopUnitsPerformance } from './components/top-units-performance';
export { AutomationPerformance } from './components/automation-performance';
export { CorrespondenceMetrics } from './components/correspondence-metrics';
export {
  DailyPerformanceSummary,
  DailyPerformanceSummarySkeleton
} from './components/daily-performance-summary';

// API Service
export { dashboardService } from './api/dashboard.service';

// Types
export type {
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
  AutomationPerformanceMetrics,
  BacklogTask,
  BacklogMetrics,
  UserPerformance,
  ChartDataPoint,
  TimeSeriesDataPoint,
  MultiSeriesDataPoint,
  DashboardFilters,
  DashboardCardProps,
  DashboardError
} from './types';

// Overview Types
export type {
  CorrespondenceDashboardSummary,
  DailyPerformanceSummaryViewModel,
  DailyPerformanceQuery,
  DailyUnitPerformance,
  DailyBreakdown,
  VelocityMetrics,
  OverviewQuery,
  TopUnitEntry,
  TypeDistributionEntry,
  AutomationTypeEntry,
  StatusDistributionEntry,
  BacklogUnitEntry
} from './types/overview';
