import { LeaveInterruption } from '@/features/leave-interruption/types/leave-interruption';
import { LeaveCancellation } from '@/features/leave-cancellation/types/leave-cancellation';

export interface LeaveRequest {
  id?: string;
  employeeId?: string;
  employeeNumber?: string;
  employeeName?: string;
  organizationalUnitId?: string;
  organizationalUnitName?: string;
  createdByUserId?: string;
  createdByUserName?: string;
  leaveType?: number;
  leaveTypeName?: string;
  startDate?: string;
  endDate?: string;
  requestedDays?: number;
  approvedDays?: number;
  status?: number;
  statusName?: string;
  reason?: string;
  rejectionReason?: string;
  approvedAt?: string;
  approvedByUserId?: string;
  approvedByUserName?: string;
  cancelledByUserId?: string;
  cancelledByUserName?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  isInterrupted?: boolean;
  actualEndDate?: string;
  requestNumber?: string;
  createAt?: string;
  createBy?: string;
  lastUpdateAt?: string;
  lastUpdateBy?: string;
  statusId?: number;
  interruptions?: LeaveInterruption[];
  cancellations?: LeaveCancellation[];
}

export interface LeaveRequestList {
  id?: string;
  employeeId?: string;
  employeeNumber?: string;
  employeeName?: string;
  organizationalUnitId?: string;
  organizationalUnitName?: string;
  leaveType?: number;
  leaveTypeName?: string;
  startDate?: string;
  endDate?: string;
  requestedDays?: number;
  approvedDays?: number;
  status?: number;
  statusName?: string;
  requestNumber?: string;
  isInterrupted?: boolean;
  approvedAt?: string;
  approvedByUserName?: string;
  createAt?: string;
  statusId?: number;
}

export interface CreateLeaveRequestPayload {
  employeeId: string;
  organizationalUnitId?: string;
  leaveType: number;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface UpdateLeaveRequestPayload {
  id: string;
  leaveType?: number;
  startDate?: string;
  endDate?: string;
  reason?: string;
}

export interface ApproveLeaveRequestPayload {
  id: string;
  approvedDays?: number;
  notes?: string;
}

export interface RejectLeaveRequestPayload {
  id: string;
  rejectionReason: string;
}

export interface CancelLeaveRequestPayload {
  id: string;
  cancellationReason?: string;
}

export interface InterruptLeaveRequestPayload {
  id: string;
  interruptionDate: string;
  returnDate: string;
  interruptionType: number;
  reason?: string;
}

export interface GetAllLeaveRequestsQuery {
  page?: number;
  pageSize?: number;
  searchText?: string;
  employeeId?: string;
  organizationalUnitId?: string;
  leaveType?: number;
  status?: number;
  startDateFrom?: string;
  startDateTo?: string;
}

export interface GetLeaveRequestsByEmployeeIdQuery {
  page?: number;
  pageSize?: number;
  employeeId?: string;
  leaveType?: number;
  status?: number;
}

export interface GetLeaveRequestsByStatusQuery {
  page?: number;
  pageSize?: number;
  status?: number;
  organizationalUnitId?: string;
  employeeId?: string;
}

export enum LeaveRequestStatus {
  Draft = 1,
  PendingApproval = 2,
  Approved = 3,
  Rejected = 4,
  Cancelled = 5,
  Interrupted = 6,
  Completed = 7
}

export const LeaveRequestStatusDisplay: Record<LeaveRequestStatus, string> = {
  [LeaveRequestStatus.Draft]: 'مسودة',
  [LeaveRequestStatus.PendingApproval]: 'قيد الموافقة',
  [LeaveRequestStatus.Approved]: 'موافق عليه',
  [LeaveRequestStatus.Rejected]: 'مرفوض',
  [LeaveRequestStatus.Cancelled]: 'ملغي',
  [LeaveRequestStatus.Interrupted]: 'مقطوع',
  [LeaveRequestStatus.Completed]: 'منتهية'
};

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

