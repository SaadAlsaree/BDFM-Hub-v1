export interface CreatePublicMailPayload {
  correspondenceId?: string;
  mailDate?: string; // ISO format: YYYY-MM-DD
  subject?: string;
  bodyText?: string;
  secrecyLevel?: number;
  priorityLevel?: number;
  personalityLevel?: number;
  fileId?: string;
  createdByUserId?: string;
  updatedByUserId?: string;
}
