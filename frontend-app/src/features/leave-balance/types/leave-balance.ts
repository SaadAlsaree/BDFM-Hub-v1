export interface LeaveBalance {
  id?: string;
  employeeId?: string;
  employeeNumber?: string;
  employeeName?: string;
  organizationalUnitId?: string;
  organizationalUnitName?: string;
  leaveType?: number;
  leaveTypeName?: string;
  totalBalance?: number;
  monthlyBalance?: number;
  usedBalance?: number;
  availableBalance?: number;
  monthlyUsedBalance?: number;
  lastMonthlyResetDate?: string;
  lastSyncDate?: string;
  createAt?: string;
  lastUpdateAt?: string;
}

export interface LeaveBalanceHistory {
  id?: string;
  leaveRequestId?: string;
  employeeId?: string;
  employeeNumber?: string;
  employeeName?: string;
  leaveType?: number;
  leaveTypeName?: string;
  previousBalance?: number;
  newBalance?: number;
  changeAmount?: number;
  changeReason?: string;
  changedByUserId?: string;
  changedByUserName?: string;
  changeDate?: string;
  changeType?: string;
  createAt?: string;
}

export interface GetLeaveBalanceHistoryQuery {
  page?: number;
  pageSize?: number;
  employeeId?: string;
  leaveType?: number;
  changeDateFrom?: string;
  changeDateTo?: string;
  changeType?: string;
}

export interface SyncLeaveBalancePayload {
  employeeId: string;
  leaveType: number;
}

export enum LeaveType {
  RegularDaily = 1,
  LongTerm = 2,
  Annual = 3,
  Study = 4,
  Maternity = 5,
  Mourning = 6,
  Sick = 7
}

export const LeaveTypeDisplay: Record<LeaveType, string> = {
  [LeaveType.RegularDaily]: 'عادية/يومية',
  [LeaveType.LongTerm]: 'طويلة المدة',
  [LeaveType.Annual]: 'سنوية',
  [LeaveType.Study]: 'دراسية',
  [LeaveType.Maternity]: 'أمومة',
  [LeaveType.Mourning]: 'عدة',
  [LeaveType.Sick]: 'مرضية'
};

