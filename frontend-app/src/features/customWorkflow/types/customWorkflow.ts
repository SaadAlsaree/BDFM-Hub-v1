export interface CustomWorkflowList {
  id: string;
  workflowName: string;
  triggeringUnitId: string | null;
  triggeringUnitName?: string | null;
  triggeringCorrespondenceType: CorrespondenceTypeEnum;
  triggeringCorrespondenceTypeName: string;
  description: string;
  isEnabled: boolean;
  createAt: string; // ISO datetime string
  lastUpdateAt: string | null;
  createBy: string;
  lastUpdateBy: string | null;
  status: number;
  statusName: string;
  steps: CustomWorkflowStepList[];
}

export enum CorrespondenceTypeEnum {
  Draft = 0,
  IncomingExternal = 1, // وارد خارجي
  OutgoingExternal = 2, // صادر خارجي
  IncomingInternal = 3, // وارد داخلي
  OutgoingInternal = 4, // صادر داخلي
  Memorandum = 5, // المطالعة
  Reply = 6, // رد
  Public = 7 // عام
}

export interface CustomWorkflowDetails {
  id: string;
  workflowName: string;
  triggeringUnitId: string | null;
  triggeringUnitName?: string | null;
  triggeringCorrespondenceType: CorrespondenceTypeEnum;
  triggeringCorrespondenceTypeName: string;
  description: string | null;
  isEnabled: boolean;
  createAt: string; // ISO datetime string
  lastUpdateAt: string | null;
  createBy: string;
  lastUpdateBy: string | null;
  status: number;
  statusName: string;
  steps: CustomWorkflowStepList[];
}

export interface CreateWorkflowPayload {
  id?: string;
  workflowName?: string;
  triggeringUnitId?: string; // UUID
  triggeringCorrespondenceType?: CorrespondenceTypeEnum; // CorrespondenceTypeEnum
  description?: string;
  isEnabled?: boolean;
}

export interface CustomWorkflowStepList {
  id: string;
  workflowId: string;
  stepOrder: number;
  actionType: ActionTypeEnum;
  actionTypeName: string;
  targetType: CustomWorkflowTargetTypeEnum;
  targetTypeName: string;
  targetIdentifier: string | null;
  targetIdentifierName: string | null;
  defaultInstructionText: string | null;
  defaultDueDateOffsetDays: number | null;
}

export interface CustomWorkflowStepDetails {
  id: string; // UUID
  workflowId: string; // UUID
  stepOrder: number;
  actionType: number; // ActionTypeEnum
  targetType: number; // CustomWorkflowTargetTypeEnum
  targetIdentifier: string;
  defaultInstructionText: string;
  defaultDueDateOffsetDays: number;
  createAt: string; // ISO date string
  lastUpdateAt: string; // ISO date string
  createBy: string;
  lastUpdateBy: string;
  statusId: number;
  statusName: string;
}

export interface CreateWorkflowStepPayload {
  id?: string;
  workflowId?: string; // UUID
  stepOrder?: number;
  actionType?: ActionTypeEnum; // ActionTypeEnum
  targetType?: CustomWorkflowTargetTypeEnum; // CustomWorkflowTargetTypeEnum
  targetIdentifier?: string;
  defaultInstructionText?: string;
  defaultDueDateOffsetDays?: number;
}

export const CorrespondenceTypeEnumNames: Record<
  CorrespondenceTypeEnum,
  string
> = {
  [CorrespondenceTypeEnum.Draft]: 'مسودة',
  [CorrespondenceTypeEnum.IncomingExternal]: 'وارد خارجي',
  [CorrespondenceTypeEnum.OutgoingExternal]: 'صادر خارجي',
  [CorrespondenceTypeEnum.IncomingInternal]: 'وارد داخلي',
  [CorrespondenceTypeEnum.OutgoingInternal]: 'صادر داخلي',
  [CorrespondenceTypeEnum.Memorandum]: 'المطالعة',
  [CorrespondenceTypeEnum.Reply]: 'رد',
  [CorrespondenceTypeEnum.Public]: 'عام'
};

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
  [ActionTypeEnum.Action]: 'أجراء الازم',
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
  SpecificUnit = 2
}

export const CustomWorkflowTargetTypeEnumDisplay: Record<
  CustomWorkflowTargetTypeEnum,
  string
> = {
  [CustomWorkflowTargetTypeEnum.SpecificUser]: 'مستخدم',
  [CustomWorkflowTargetTypeEnum.SpecificUnit]: 'جهة'
};
