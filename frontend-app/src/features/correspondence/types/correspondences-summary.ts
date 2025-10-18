import { CorrespondenceTypeEnum } from './register-incoming-external-mail';

export interface CorrespondencesSummary {
  totalCorrespondencesPending?: number;
  totalCorrespondencesUnderProcessing?: number;
  totalCorrespondencesCompleted?: number;
  totalCorrespondencesRejected?: number;
  totalCorrespondencesReturnedForModification?: number;
  totalCorrespondencesPostponed?: number;
  totalCorrespondences?: number;
  totalIncomingExternal?: number;
  totalOutgoingExternal?: number;
  totalIncomingInternal?: number;
  totalOutgoingInternal?: number;
  totalMemorandum?: number;
  totalReplies?: number;
  totalPublics?: number;
  totalDrafts?: number;
}

export interface ApiResponse<T> {
  succeeded: boolean;
  data: T;
  message: string;
  errors: any[];
  code: string;
}

export interface CorrespondencesQuery {
  unitId?: string | undefined; // GUID as string
  startDate?: string | undefined; // DateOnly ISO string e.g., '2025-07-29'
  endDate?: string | undefined; // DateOnly ISO string
  includeSubUnits?: boolean; // default false
  correspondenceType?: CorrespondenceTypeEnum | undefined;
}

export const defaultCorrespondencesQuery: CorrespondencesQuery = {
  unitId: undefined,
  startDate: undefined,
  endDate: undefined,
  includeSubUnits: false,
  correspondenceType: undefined
};

export type CorrespondencesSummaryResponse =
  ApiResponse<CorrespondencesSummary>;
