export interface LeaveInterruption {
  id?: string;
  leaveRequestId?: string;
  interruptionDate?: string;
  returnDate?: string;
  interruptionType?: number;
  interruptionTypeName?: string;
  reason?: string;
  interruptedByUserId?: string;
  interruptedByUserName?: string;
  employeeId?: string;
  isProcessed?: boolean;
  adjustedDays?: number;
  createAt?: string;
}

export enum LeaveInterruptionType {
  EmployeeReturn = 1,
  EarlyEnd = 2
}

export const LeaveInterruptionTypeDisplay: Record<
  LeaveInterruptionType,
  string
> = {
  [LeaveInterruptionType.EmployeeReturn]: 'عودة الموظف',
  [LeaveInterruptionType.EarlyEnd]: 'إنهاء مبكر'
};

