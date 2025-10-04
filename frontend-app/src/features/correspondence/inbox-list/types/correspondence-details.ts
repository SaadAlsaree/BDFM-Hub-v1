import { UserCorrespondenceInteraction } from "../../types/register-incoming-external-mail";

export interface CorrespondenceDetails {
  id: string;
  subject: string;
  bodyText: string;
  correspondenceType: number;
  correspondenceTypeName: string;
  correspondenceStatus: number;
  correspondenceStatusName: string;
  status: number;
  isDraft: boolean;
  statusName: string;
  mailNum: string;
  mailDate: string;
  fileId: string;
  mailFileNumber: string;
  mailFileSubject: string;
  secrecyLevel: number;
  secrecyLevelName: string;
  priorityLevel: number;
  priorityLevelName: string;
  personalityLevel: number;
  personalityLevelName: string;
  createdByUserId: string;
  createdByUserName: string;
  createdAt: string;
  signatoryUserId: string;
  signatoryUserName: string;
  finalizedAt: string;
  externalEntityId: string;
  externalEntityName: string;
  externalSubEntities: string[];
  workflowSteps: WorkflowStep[];
  referencesToCorrespondences: CorrespondenceLink[];
  referencedByCorrespondences: CorrespondenceLink[];
  isStarredByCurrentUser: boolean;
  postponedUntil: string;
  isInTrash: boolean;
  userCorrespondenceInteraction: UserCorrespondenceInteraction;
  deletedAt: string;
  ocrText: string;
}

// TypeScript enum equivalent of CorrespondenceStatusEnum


export enum CorrespondenceStatusEnum {

  // Registered = 1,
  PendingReferral = 2,
  UnderProcessing = 3,
  PendingApproval = 4,
  Approved = 5,
  InSignatureAgenda = 6,
  Signed = 7,
  // SentOrOutgoing = 8,
  Completed = 9,
  // Rejected = 10,
  ReturnedForModification = 11,
  Postponed = 12,
  Cancelled = 13
}


export const CorrespondenceStatusEnumArabicMap: Record<CorrespondenceStatusEnum, string> = {

  // [CorrespondenceStatusEnum.Registered]: "مسجل",
  [CorrespondenceStatusEnum.PendingReferral]: "قيد الانتظار",
  [CorrespondenceStatusEnum.UnderProcessing]: "قيد المعالجة",
  [CorrespondenceStatusEnum.PendingApproval]: "قيد الموافقة",
  [CorrespondenceStatusEnum.Approved]: "موافق",
  [CorrespondenceStatusEnum.InSignatureAgenda]: "قيد التوقيع",
  [CorrespondenceStatusEnum.Signed]: "موقع",
  // [CorrespondenceStatusEnum.SentOrOutgoing]: "إرسال أو صادر",
  [CorrespondenceStatusEnum.Completed]: "مكتمل",
  // [CorrespondenceStatusEnum.Rejected]: "مرفوض",
  [CorrespondenceStatusEnum.ReturnedForModification]: "إرجاع للتعديل",
  [CorrespondenceStatusEnum.Postponed]: "مؤجل",
  [CorrespondenceStatusEnum.Cancelled]: "ملغي"
};


export interface WorkflowStep {
  id: string;
  correspondenceId: string;
  actionType: number;
  actionTypeName: string;
  fromUserId: string;
  fromUser: UserInfo;
  fromUnitId: string;
  fromUnit: OrganizationalUnit;
  toPrimaryRecipientType: number;
  toPrimaryRecipientTypeName: string;
  toPrimaryRecipientId: string;
  toPrimaryRecipientName: string;
  instructionText: string;
  dueDate: string;
  status: number;
  workflowStepStatusName: string;
  isTimeSensitive: boolean;

  secondaryRecipients: SecondaryRecipient[];
  notifications: WorkflowNotification[];
  interactions: WorkflowInteraction[];
  recipientActions: RecipientAction[];
  todos: WorkflowStepTodo[];
}

export interface UserInfo {
  id: string;
  username: string;
  userLogin: string;
  organizationalUnitId: string;
  organizationalUnitName: string;
  organizationalUnitCode: string;
}

export interface OrganizationalUnit {
  unitName: string;
  unitCode: string;
  unitDescription: string;
}

export interface SecondaryRecipient {
  id: string;
  recipientId: string;
  recipientType: number;
  recipientName: string;
  instructionText: string;
  purpose: string;
}

export interface WorkflowNotification {
  id: string;
  userId: string;
  userName: string;
  message: string;
  isRead: boolean;
  notificationType: number;
}

export interface WorkflowInteraction {
  id: string;
  recipientType: number;
  recipientId: string;
  purpose: string;
  instructionText: string;
}

export interface RecipientAction {
  id: string;
  actionDescription: string;
  actionTimestamp: string; // ISO date string
  actionTakenByUserId: string;
  internalActionTypeEnum: number;
  internalActionTypeEnumName: string;
  actionTakenByUserName: string;
  actionTakenByUnitId: string;
  actionTakenByUnitName: string;
  notes: string;
}

export interface CorrespondenceLink {
  linkId: string;
  linkType: number;
  linkTypeName: string;
  targetCorrespondenceId: string;
  targetSubject: string;
  targetRefNo: string;
  direction: string;
  notes: string;
}

export interface WorkflowStepTodo {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: string; // or Date, if you're using Date objects in your TS app
  notes?: string;
  createAt: string; // or Date
}

export interface WorkflowStepTodoPayload {
  id?: string;
  workflowStepId?: string;
  title?: string;
  description?: string;
  isCompleted?: boolean;
  dueDate?: string; // ISO 8601 format
  notes?: string;
}


export interface WorkflowStepTodoStatusPayload {

  workflowStepTodoId?: string;
  isCompleted?: boolean;
}


