export interface CorrespondenceMetricsViewModel {
  totalCount: number;
  activeCount: number;
  completedCount: number;
  pendingCount: number;
  overdueCount: number;
  averageProcessingTimeInDays: number;

  // Monthly Volume Data
  monthlyVolume: {
    year: number;
    month: number;
    monthName: string;
    count: number;
    incomingCount: number;
    outgoingCount: number;
    internalCount: number;
  }[];

  // Type Distribution
  typeDistribution: {
    correspondenceType: number;
    typeName: string;
    count: number;
    percentage: number;
  }[];

  // Status Distribution
  statusDistribution: {
    status: number;
    statusName: string;
    count: number;
    percentage: number;
  }[];

  // Priority Distribution
  priorityDistribution: {
    priority: number;
    priorityName: string;
    count: number;
    percentage: number;
  }[];

  generatedAt: string;
}

export interface CorrespondenceMetricsQuery {
  unitId?: string;
  startDate?: string;
  endDate?: string;
  monthsBack?: number;
  correspondenceType?: CorrespondenceTypeEnum;
  status?: string;
}

export enum CorrespondenceTypeEnum {
  Draft = 0,
  IncomingExternal = 1, // وارد خارجي
  OutgoingExternal = 2, // صادر خارجي
  IncomingInternal = 3, // وارد داخلي
  OutgoingInternal = 4, // صادر داخلي
  Memorandum = 5, // المطالعة
  Reply = 6 // رد
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
  [CorrespondenceTypeEnum.Reply]: 'رد'
};
