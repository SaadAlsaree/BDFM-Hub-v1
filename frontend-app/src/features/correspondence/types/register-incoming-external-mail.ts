export interface SearchCorrespondenceList {
  id?: string;
  externalReferenceNumber?: string;
  internalNumber?: string;
  mailNum?: string;
  mailDate?: string; // ISO date format: "YYYY-MM-DD"
  subject?: string;
  correspondenceType?: CorrespondenceTypeEnum;
  correspondenceTypeName?: string;
  correspondenceStatus?: number;
  correspondenceStatusName?: string;
  priorityLevel?: number;
  priorityLevelName?: string;
  createAt?: string; // ISO timestamp format
  createBy?: string;
  isDraft?: boolean;
  mailFileName?: string;
  mailFileNumber?: string;
}

export interface InboxList {
  correspondenceId: string;
  workflowStepId: string;
  subject: string;
  correspondenceType: CorrespondenceTypeEnum;
  correspondenceTypeName: string;
  correspondenceStatusName?: string;
  correspondenceStatus?: number;
  externalReferenceNumber: string;
  externalReferenceDate: string;
  mailNum: string;
  mailDate: string;
  priorityLevel: number;
  priorityLevelName: string;
  secrecyLevel: number;
  secrecyLevelName: string;
  receivedDate: string;
  dueDate: string;
  status: number;
  createdByUnitName: string;
  workflowStepStatusName: string;
  statusName: string;
  fileId: string;
  fileNumber: string;
  isDraft: boolean;
  unreadCount: number;
  postponedUntilCount: number;
  inTrashCount: number;
  starredCount: number;
  dueDateCount: number;
  userCorrespondenceInteraction?: UserCorrespondenceInteraction;
}

export interface UserCorrespondenceInteraction {
  userId?: string;
  correspondenceId?: string;
  isStarred?: boolean;
  postponedUntil?: string;
  isPostponed?: boolean;
  lastReadAt?: string;
  isInTrash?: boolean;
  isRead?: boolean;
  receiveNotifications?: boolean;
}

export interface ExternalCorrespondencePayload {
  id?: string;
  externalReferenceNumber?: string;
  externalReferenceDate?: string;
  originatingExternalEntityId?: string;
  originatingSubEntities?: string[];
  subject?: string;
  bodyText?: string;
  secrecyLevel?: SecrecyLevelEnum;
  priorityLevel?: PriorityLevelEnum;
  personalityLevel?: PersonalityLevelEnum;
  mailNum: string;
  mailDate?: string;
  externalEntityId?: string;
  createdByUserId?: string;
  fileNumberToReuse?: string;
}

export interface CorrespondenceLinkPayload {
  sourceCorrespondenceId: string;
  linkedCorrespondenceId: string;
  linkType: CorrespondenceLinkType;
  notes: string;
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

export const CorrespondenceTypeEnumDisplay: Record<
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
  [CorrespondenceTypeEnum.Public]: 'أعمام'
};

export enum CorrespondenceLinkType {
  RefersTo = 1, // المراسلة الحالية تشير إلى المراسلة المرتبطة
  ReplyTo = 2, // المراسلة الحالية هي رد على المراسلة المرتبطة
  FollowUpTo = 3, // المراسلة الحالية هي متابعة للمراسلة المرتبطة
  RelatedTo = 4, // مجرد ارتباط عام بالموضوع
  Supersedes = 5, // المراسلة الحالية تلغي/تستبدل المراسلة المرتبطة
  ContinuationOf = 6 // المراسلة الحالية هي استكمال للمراسلة المرتبطة
}

export enum SecrecyLevelEnum {
  None = 0, // عام
  Limited = 1, // محدود
  Secret = 2, // سري
  TopSecret = 3 // سري للغاية
}

export const SecrecyLevelEnumDisplay: Record<SecrecyLevelEnum, string> = {
  [SecrecyLevelEnum.None]: 'عام',
  [SecrecyLevelEnum.Limited]: 'محدود',
  [SecrecyLevelEnum.Secret]: 'سري',
  [SecrecyLevelEnum.TopSecret]: 'سري للغاية'
};

export enum PriorityLevelEnum {
  None = 0, // غير مرتبة
  Normal = 1, // عادي
  Urgent = 2, // مستعجل
  VeryUrgent = 3, // مستعجل جدا
  Immediate = 4 // فوري
}

export const PriorityLevelEnumDisplay: Record<PriorityLevelEnum, string> = {
  [PriorityLevelEnum.None]: 'غير مرتبة',
  [PriorityLevelEnum.Normal]: 'عادي',
  [PriorityLevelEnum.Urgent]: 'مستعجل',
  [PriorityLevelEnum.VeryUrgent]: 'مستعجل جدا',
  [PriorityLevelEnum.Immediate]: 'فوري'
};

export enum PersonalityLevelEnum {
  General = 0, // عام
  Personal = 1, // شخصي
  ToBeOpenedByAddresseeOnly = 2 // يفتح بالذات
}

export const PersonalityLevelEnumDisplay: Record<PersonalityLevelEnum, string> =
{
  [PersonalityLevelEnum.General]: 'عام',
  [PersonalityLevelEnum.Personal]: 'شخصي',
  [PersonalityLevelEnum.ToBeOpenedByAddresseeOnly]: 'يفتح بالذات'
};

export interface UpdateCorrespondenceStatusPayload {
  correspondenceId: string; // UUID
  newStatus: CorrespondenceStatusEnum;
  correspondenceType: CorrespondenceTypeEnum;
  reason: string;
}

export enum CorrespondenceStatusEnum {
  PendingReferral = 1,
  UnderProcessing = 2,
  Completed = 3,
  Rejected = 4,
  ReturnedForModification = 5,
  Postponed = 6
}

export const CorrespondenceStatusEnumArabicMap: Record<
  CorrespondenceStatusEnum,
  string
> = {
  [CorrespondenceStatusEnum.PendingReferral]: 'قيد الانتظار',
  [CorrespondenceStatusEnum.UnderProcessing]: 'قيد المعالجة',
  [CorrespondenceStatusEnum.Completed]: 'مكتمل',
  [CorrespondenceStatusEnum.Rejected]: 'مرفوض',
  [CorrespondenceStatusEnum.ReturnedForModification]: 'إرجاع للتعديل',
  [CorrespondenceStatusEnum.Postponed]: 'مؤجل'
};

export interface CorrespondenceFilter {
  page?: number; // default: 1
  pageSize?: number; // default: 10

  organizationalUnitId?: string; // GUID
  mailNum?: string; // e.g., "500-2025"
  fromDate?: string; // DateOnly in ISO format (e.g., "2025-06-15")
  toDate?: string; // DateOnly in ISO format
  subject?: string;
  bodyText?: string;
  externalReferenceNumber?: string;
  externalReferenceDate?: string; // Date as string (ISO)
  externalEntityId?: string;
  fileNumber?: string;
  secrecyLevel?: SecrecyLevelEnum;
  priorityLevel?: PriorityLevelEnum;
  personalityLevel?: PersonalityLevelEnum;
}

export interface OutgoingInternalMailPayload {
  id?: string;
  mailNum?: string;
  mailDate: string; // ISO Date format e.g., "2025-07-29"
  subject: string;
  bodyText: string;
  secrecyLevel: SecrecyLevelEnum;
  priorityLevel: PriorityLevelEnum;
  personalityLevel: PersonalityLevelEnum;
  fileId: string | undefined; // UUID
  linkMailId: string; // UUID
  createdByUserId: string; // UUID
  fileNumberToReuse: string;
}

export interface IncomingInternalMailPayload {
  mailNum?: string;
  mailDate: string; // ISO 8601 format e.g., "2025-07-29"
  subject: string;
  bodyText: string;
  secrecyLevel: SecrecyLevelEnum;
  priorityLevel: PriorityLevelEnum;
  personalityLevel: PersonalityLevelEnum;
  fileId: string | undefined; // UUID
  linkMailId: string; // UUID
  createdByUserId: string; // UUID
  fileNumberToReuse: string;
}
