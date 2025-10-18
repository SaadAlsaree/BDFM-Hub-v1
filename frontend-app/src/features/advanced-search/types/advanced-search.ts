import {
  PersonalityLevelEnum,
  PriorityLevelEnum,
  SecrecyLevelEnum
} from '@/features/correspondence/types/register-incoming-external-mail';

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
