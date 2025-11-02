export interface LeaveWorkflowStepTemplateDto {
  id?: string;
  workflowId?: string;
  stepOrder?: number;
  actionType?: number;
  actionTypeName?: string;
  targetType?: number;
  targetTypeName?: string;
  targetIdentifier?: string;
  targetIdentifierName?: string;
  defaultInstructionText?: string;
  defaultDueDateOffsetDays?: number;
  sequence?: number;
  isActive?: boolean;
}

export interface LeaveWorkflow {
  id?: string;
  workflowName?: string;
  triggeringUnitId?: string;
  triggeringUnitName?: string;
  triggeringLeaveType?: number;
  triggeringLeaveTypeName?: string;
  description?: string;
  isEnabled?: boolean;
  createAt?: string;
  lastUpdateAt?: string;
  createBy?: string;
  lastUpdateBy?: string;
  status?: number;
  statusName?: string;
  steps?: LeaveWorkflowStepTemplateDto[];
}

export interface LeaveWorkflowList {
  id?: string;
  workflowName?: string;
  triggeringUnitId?: string;
  triggeringUnitName?: string;
  triggeringLeaveType?: number;
  triggeringLeaveTypeName?: string;
  description?: string;
  isEnabled?: boolean;
  createAt?: string;
  lastUpdateAt?: string;
  createBy?: string;
  lastUpdateBy?: string;
  status?: number;
  statusName?: string;
}

export interface CreateLeaveWorkflowPayload {
  workflowName: string;
  triggeringUnitId?: string;
  triggeringLeaveType?: number;
  description?: string;
  isEnabled?: boolean;
}

export interface UpdateLeaveWorkflowPayload {
  id: string;
  workflowName: string;
  triggeringUnitId?: string;
  triggeringLeaveType?: number;
  description?: string;
  isEnabled?: boolean;
}

export interface GetLeaveWorkflowListQuery {
  page?: number;
  pageSize?: number;
  searchText?: string;
  triggeringUnitId?: string;
  triggeringLeaveType?: number;
  isEnabled?: boolean;
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

