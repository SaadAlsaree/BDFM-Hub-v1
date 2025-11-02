export interface LeaveWorkflowStepTemplate {
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
  createAt?: string;
  lastUpdateAt?: string;
  createBy?: string;
  lastUpdateBy?: string;
  statusId?: number;
  status?: number;
  statusName?: string;
  sequence?: number;
  isActive?: boolean;
}

export interface CreateLeaveWorkflowStepTemplatePayload {
  workflowId: string;
  stepOrder: number;
  actionType: number;
  targetType: number;
  targetIdentifier?: string;
  defaultInstructionText?: string;
  defaultDueDateOffsetDays?: number;
  isActive?: boolean;
}

export interface UpdateLeaveWorkflowStepTemplatePayload {
  id: string;
  workflowId: string;
  stepOrder: number;
  actionType: number;
  targetType: number;
  targetIdentifier?: string;
  defaultInstructionText?: string;
  defaultDueDateOffsetDays?: number;
  isActive?: boolean;
}

export enum ActionTypeEnum {
  RegisterIncoming = 1,
  RequestApproval = 2,
  Action = 3,
  Reject = 4,
  Return = 5,
  Send = 6,
  Archive = 7,
  TakeUnderConsideration = 8,
  RequestInformation = 9,
  SendToExternalReferral = 10,
  SendToInternalReferral = 11
}

export const ActionTypeDisplay: Record<ActionTypeEnum, string> = {
  [ActionTypeEnum.RegisterIncoming]: 'تسجيل الوارد',
  [ActionTypeEnum.RequestApproval]: 'طلب الموافقة',
  [ActionTypeEnum.Action]: 'إجراء لازمة',
  [ActionTypeEnum.Reject]: 'رفض',
  [ActionTypeEnum.Return]: 'إرجاع',
  [ActionTypeEnum.Send]: 'إرسال',
  [ActionTypeEnum.Archive]: 'أرشيف',
  [ActionTypeEnum.TakeUnderConsideration]: 'وضع تحت اليد',
  [ActionTypeEnum.RequestInformation]: 'طلب معلومات',
  [ActionTypeEnum.SendToExternalReferral]: 'إرسال إلى جهة خارجية',
  [ActionTypeEnum.SendToInternalReferral]: 'إرسال إلى جهة داخلية'
};

export enum CustomWorkflowTargetTypeEnum {
  SpecificUser = 1,
  SpecificUnit = 2,
  RoleInUnit = 3,
  ManagerOfUnit = 4,
  HeadOfDevice = 5
}

export const CustomWorkflowTargetTypeDisplay: Record<
  CustomWorkflowTargetTypeEnum,
  string
> = {
  [CustomWorkflowTargetTypeEnum.SpecificUser]: 'مستخدم',
  [CustomWorkflowTargetTypeEnum.SpecificUnit]: 'جهة',
  [CustomWorkflowTargetTypeEnum.RoleInUnit]: 'صلاحية في وحدة',
  [CustomWorkflowTargetTypeEnum.ManagerOfUnit]: 'مدير الوحدة',
  [CustomWorkflowTargetTypeEnum.HeadOfDevice]: 'رئيس الجهاز'
};

