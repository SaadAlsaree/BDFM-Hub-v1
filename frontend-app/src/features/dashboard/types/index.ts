// Dashboard Query Parameters
export interface DashboardQuery {
    unitId?: string;
    startDate?: string;
    endDate?: string;
    monthsBack?: number;
}

export interface CorrespondenceMetricsQuery extends DashboardQuery {
    correspondenceType?: string;
    status?: string;
}

export interface BacklogDetailsQuery {
    unitId?: string;
    daysOverdue?: number;
    status?: string;
    includeTaskDetails?: boolean;
}

export interface PerformanceAnalyticsQuery extends DashboardQuery {
    topUnitsCount?: number;
    includeUserPerformance?: boolean;
}

// Core Data Models
export interface CorrespondenceTypeDistribution {
    type: string;
    count: number;
    percentage: number;
    color?: string;
}

export interface CorrespondenceStatusDistribution {
    status: string;
    count: number;
    percentage: number;
    color?: string;
}

export interface UnitCorrespondenceVolume {
    unitId: string;
    unitName: string;
    unitCode: string;
    totalCorrespondence: number;
    activeCorrespondence: number;
    completedCorrespondence: number;
    averageProcessingTime: number;
    efficiencyScore: number;
}

export interface AutomationPerformanceMetrics {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    successRate: number;
    averageExecutionTime: number;
    totalProcessingTime: number;
    automationTypes: {
        type: string;
        executions: number;
        successRate: number;
    }[];
}

export interface BacklogTask {
    taskId: string;
    correspondenceId: string;
    taskName: string;
    assignedTo: string;
    dueDate: string;
    createdDate: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    status: string;
    daysOverdue: number;
    isTimeSensitive: boolean;
    unitName: string;
}

export interface BacklogMetrics {
    totalTasks: number;
    overdueTasks: number;
    timeSensitiveTasks: number;
    averageTaskAge: number;
    unitBreakdown: {
        unitId: string;
        unitName: string;
        totalTasks: number;
        overdueTasks: number;
    }[];
    tasks?: BacklogTask[];
}

export interface UserPerformance {
    userId: string;
    userName: string;
    completedTasks: number;
    averageProcessingTime: number;
    onTimeDeliveryRate: number;
    efficiencyScore: number;
}

// Main ViewModels
export interface DashboardOverviewViewModel {
    // Quick Stats
    unreadIncomingMailCount: number;
    totalActiveCorrespondence: number;
    totalCorrespondence: number;
    averageMonthlyVolume: number;

    // Distributions
    correspondenceTypeDistribution: CorrespondenceTypeDistribution[];
    correspondenceStatusDistribution: CorrespondenceStatusDistribution[];

    // Top Units
    topUnits: UnitCorrespondenceVolume[];

    // Automation Performance
    automationPerformance: AutomationPerformanceMetrics;

    // Backlog Overview
    backlogMetrics: BacklogMetrics;

    // Time Range
    dateRange: {
        startDate: string;
        endDate: string;
    };
}

export interface CorrespondenceMetricsViewModel {
    totalCount: number;
    activeCount: number;
    completedCount: number;
    pendingCount: number;
    overdueCount: number;
    averageProcessingTimeInDays: number;

    // Monthly Volume Data
    monthlyVolume: {
        year: number;
        month: number;
        monthName: string;
        count: number;
        incomingCount: number;
        outgoingCount: number;
        internalCount: number;
    }[];

    // Type Distribution
    typeDistribution: {
        correspondenceType: number;
        typeName: string;
        count: number;
        percentage: number;
    }[];

    // Status Distribution
    statusDistribution: {
        status: number;
        statusName: string;
        count: number;
        percentage: number;
    }[];

    // Priority Distribution
    priorityDistribution: {
        priority: number;
        priorityName: string;
        count: number;
        percentage: number;
    }[];

    generatedAt: string;
}

export interface BacklogDetailsViewModel {
    totalTasks: number;
    overdueTasks: number;
    timeSensitiveTasks: number;
    averageTaskAge: number;

    // Unit Breakdown
    unitBreakdown: {
        unitId: string;
        unitName: string;
        totalTasks: number;
        overdueTasks: number;
        averageTaskAge: number;
        oldestTask: number;
    }[];

    // Task Details (if requested)
    tasks?: BacklogTask[];

    // Priority Breakdown
    priorityBreakdown: {
        priority: string;
        count: number;
        averageAge: number;
        overdueCount: number;
    }[];
}

export interface PerformanceAnalyticsViewModel {
    // Overall Metrics
    totalThroughput: number;
    averageProcessingTime: number;
    onTimeDeliveryRate: number;
    overallEfficiencyScore: number;

    // Trend Analysis
    performanceTrends: {
        period: string;
        throughput: number;
        averageProcessingTime: number;
        onTimeDeliveryRate: number;
        efficiencyScore: number;
        growthRate: number;
    }[];

    // Unit Performance
    unitPerformance: {
        unitId: string;
        unitName: string;
        throughput: number;
        averageProcessingTime: number;
        onTimeDeliveryRate: number;
        efficiencyScore: number;
        rank: number;
    }[];

    // User Performance (if requested)
    userPerformance?: UserPerformance[];

    // Processing Time Analysis
    processingTimeAnalysis: {
        timeRange: string;
        count: number;
        percentage: number;
    }[];
}

export interface QuickStatsViewModel {
    unreadCount: number;
    tasksToday: number;
    overdueTasks: number;
    completionRate: number;
    averageProcessingTime: number;
    activeWorkflows: number;
}

// Chart Data Interfaces
export interface ChartDataPoint {
    label: string;
    value: number;
    color?: string;
    percentage?: number;
}

export interface TimeSeriesDataPoint {
    date: string;
    value: number;
    label?: string;
}

export interface MultiSeriesDataPoint {
    date: string;
    [key: string]: string | number;
}

// Dashboard Filter Options
export interface DashboardFilters {
    unitId?: string;
    startDate?: Date;
    endDate?: Date;
    correspondenceType?: string;
    status?: string;
    priority?: string;
    dateRange?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

// Dashboard Card Props
export interface DashboardCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ComponentType<any>;
    trend?: {
        value: number;
        isPositive: boolean;
        period: string;
    };
    onClick?: () => void;
    loading?: boolean;
    error?: string;
}

// Error Types
export interface DashboardError {
    code: string;
    message: string;
    details?: string;
}
