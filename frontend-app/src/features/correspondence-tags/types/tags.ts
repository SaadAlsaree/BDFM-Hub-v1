import { IResponseList } from '@/types/response';
import { UserCorrespondenceInteraction } from '../../correspondence/types/register-incoming-external-mail';
import {
  UserInfo,
  OrganizationalUnit
} from '../../correspondence/inbox-list/types/correspondence-details';

export interface CorrespondenceTag {
  id?: string;
  correspondenceId: string;
  name?: string;
  category?: number;
  isAll?: boolean;
  toPrimaryRecipientType?: number;
  toPrimaryRecipientId?: string;
}

export interface CorrespondenceTagItem {
  name?: string;
  category?: number;
  isAll?: boolean;
  toPrimaryRecipientType?: number;
  toPrimaryRecipientId?: string;
}

export interface CorrespondenceTagsRequest {
  correspondenceId: string;
  data: CorrespondenceTagItem[];
}

export enum TagCategoryEnum {
  General = 1, // أعمام
  About = 2 // صوره عنه
}

export const TagCategoryEnumDisplay: Record<TagCategoryEnum, string> = {
  [TagCategoryEnum.General]: 'أعمام',
  [TagCategoryEnum.About]: 'صوره عنه'
};

export interface CorrespondenceTagQuery {
  page?: number;
  pageSize?: number;
  mailNum?: string;
  category?: TagCategoryEnum;
  searchTerm?: string;
}

export interface CorrespondenceTagDetail {
  tagId: string;
  tagName: string;
  category: number;
  categoryName: string;
  isAll: boolean;
  fromUserId: string;
  fromUser: UserInfo;
  fromUnitId: string;
  fromUnit: OrganizationalUnit;
  toPrimaryRecipientType: number;
  toPrimaryRecipientTypeName: string;
  toPrimaryRecipientId: string;
  toPrimaryRecipientName: string;
}

export interface TaggedCorrespondenceItem {
  correspondenceId: string;
  workflowStepId: string;
  subject: string;
  correspondenceType: number;
  correspondenceStatus: number;
  correspondenceTypeName: string;
  correspondenceStatusName: string;
  externalReferenceNumber: string;
  externalReferenceDate: string;
  mailNum: string;
  mailDate: string;
  createdByUnitName: string;
  priorityLevel: number;
  priorityLevelName: string;
  secrecyLevel: number;
  secrecyLevelName: string;
  receivedDate: string;
  dueDate: string;
  status: number;
  workflowStepStatusName: string;
  statusName: string;
  unreadCount: number;
  postponedUntilCount: number;
  inTrashCount: number;
  starredCount: number;
  dueDateCount: number;
  fileId: string;
  fileNumber: string;
  isDraft: boolean;
  userCorrespondenceInteraction: UserCorrespondenceInteraction;
  tags: CorrespondenceTagDetail[];
}
export enum RecipientTypeEnum {
  User = 1, // مستخدم
  Unit = 2, // جهة
  ExternalEntity = 3 // جهة خارجية
}

export const RecipientTypeDisplay: Record<RecipientTypeEnum, string> = {
  [RecipientTypeEnum.User]: 'مستخدم',
  [RecipientTypeEnum.Unit]: 'جهة',
  [RecipientTypeEnum.ExternalEntity]: 'جهة خارجية'
};

export type TaggedCorrespondenceResponse =
  IResponseList<TaggedCorrespondenceItem>;
