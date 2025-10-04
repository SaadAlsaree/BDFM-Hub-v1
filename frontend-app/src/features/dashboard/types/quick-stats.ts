export interface CorrespondenceSummaryStats {
    unreadMail: number;
    totalActiveCorrespondence: number;
    totalCorrespondence: number;
    averageMonthlyVolume: number;
    totalBackloggedTasks: number;
    overdueTasks: number;
    automationSuccessRate: number;
    filteredByUnitName: string;
}

export interface CorrespondenceSummaryStatsQuery {
    unitId?: string;

}

