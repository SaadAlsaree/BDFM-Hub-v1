export interface BacklogReport {
    summary: BacklogSummary;
    taskDetails: BacklogTask[];
    unitBreakdown: UnitBreakdown[];
    generatedAt: string; // ISO date string
}

export interface BacklogSummary {
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

export interface BacklogTask {
    taskId: string;
    correspondenceId: string;
    correspondenceSubject: string;
    mailNum: string;
    status: number;
    statusName: string;
    actionType: number;
    actionTypeName: string;
    createdDate: string; // ISO date string
    dueDate: string; // ISO date string
    daysInBacklog: number;
    daysOverdue: number;
    fromUnitName: string;
    instructionText: string;
    isTimeSensitive: boolean;
}

export interface UnitBreakdown {
    unitId: string;
    unitName: string;
    backloggedTasks: number;
    overdueTasks: number;
    averageTaskAge: number;
    tasksDueToday: number;
    tasksDueThisWeek: number;
    topOverdueTasks: BacklogTask[];
}


export interface BacklogReportQuery {
    unitId?: string;
    daysOverdue?: number;
    status?: number;
    includeTaskDetails?: boolean;
}




