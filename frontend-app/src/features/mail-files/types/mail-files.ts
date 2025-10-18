export interface CorrespondenceListDto {
  id: string;
  subject: string;
  bodyText: string;
  externalReferenceNumber: string;
  externalReferenceDate: string; // ISO Date string
  internalReferenceNumber: string;
  internalDate: string; // ISO Date string
  correspondenceType: number;
  correspondenceTypeName: string;
  status: number;
  statusName: string;
  createAt: string; // ISO Date string
  attachmentCount: number;
  hasAttachments: boolean;
}

export interface CorrespondenceCollectionDto {
  items: CorrespondenceListDto[];
  totalCount: number;
}

export interface IMailFileContent {
  id?: string;
  fileNumber: string;
  name?: string;
  subject: string;
  createAt?: string; // ISO Date string
  createBy?: string;
  status?: number;
  statusName?: string;
  correspondences?: CorrespondenceCollectionDto;
}

export interface IMailFileDetail {
  id?: string;
  fileNumber?: string;
  name?: string;
  subject?: string;
  createAt?: string; // ISO Date string
  createBy?: string;
  status?: number;
  statusName?: string;
  correspondenceCount?: number;
}

export interface IMailFileList {
  id?: string;
  fileNumber?: string;
  name?: string;
  subject?: string;
  createAt?: string; // ISO 8601 date string
  status?: number;
  statusName?: string;
  correspondenceCount?: number;
}

export interface IMailFilePayload {
  id?: string;
  name?: string;
  subject: string;
  status?: number;
}

export interface IMailFileContentQuery {
  mailFileId: string; // GUID represented as string
  page?: number;
  pageSize?: number;

  sortField?: string;
  sortDirection?: string;
  // Filtering
  searchTerm?: string;
  statusId?: number;
  fromDate?: string;
  toDate?: string;
}

export interface IMailFileListQuery {
  page?: number;
  pageSize?: number;

  sortField?: string;
  sortDirection?: string;

  searchTerm?: string;
  statusId?: number;
  fromDate?: string;
  toDate?: string;
}

export interface MailFileDto {
  items: IMailFileList[];
  totalCount: number;
}
