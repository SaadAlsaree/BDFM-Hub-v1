export interface IAnnouncementList {
  id: string;
  title: string;
  description: string;
  variant?: 'info' | 'warning' | 'success' | string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  userId: string;
  userFullName: string;
  organizationalUnitId: string;
  unitName: string;
  createAt: string;
}

export interface IAnnouncementDetail extends IAnnouncementList {}

export interface IAnnouncementPayload {
  id?: string;
  title: string;
  description: string;
  variant?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface IAnnouncementListQuery {
  page?: number ;
  pageSize?: number;
  searchTerm?: string;
  isActive?: boolean;
}

export interface AnnouncementDto {
  items: IAnnouncementList[];
  totalCount: number;
}
