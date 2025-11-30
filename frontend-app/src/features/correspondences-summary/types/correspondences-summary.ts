
import { CorrespondenceTypeEnum } from '@/features/correspondence/types/register-incoming-external-mail';

export interface ApiResponse<T> {
  succeeded: boolean;
  data: T;
  message: string;
  errors: any[];
  code: string;
}

export interface UnitCorrespondenceSummary {
  unitId: string;
  unitName: string;
  unitCode: string;
  unitType: number;
  unitTypeName: string;
  totalCorrespondences: number;
  totalCorrespondencesPending: number;
  totalCorrespondencesUnderProcessing: number;
  totalCorrespondencesCompleted: number;
  totalCorrespondencesRejected: number;
  totalCorrespondencesReturnedForModification: number;
  totalCorrespondencesPostponed: number;
  totalCorrespondencesForwarded: number;
}

export type UnitCorrespondenceSummaryResponse = ApiResponse<UnitCorrespondenceSummary[]>;

export interface UnitCorrespondenceSummaryQuery {
  unitId?: string; // GUID as string
  startDate?: string; // DateOnly ISO string e.g., '2025-07-29'
  endDate?: string; // DateOnly ISO string
  includeSubUnits?: boolean; // default false
  correspondenceType?: CorrespondenceTypeEnum;
}

export const defaultUnitCorrespondenceSummaryQuery: UnitCorrespondenceSummaryQuery = {
  unitId: undefined,
  startDate: undefined,
  endDate: undefined,
  includeSubUnits: false,
  correspondenceType: undefined
};