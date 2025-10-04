

export interface CorrespondenceTemplatesDetail {
  id?: string;
  templateName?: string;
  subject: string;
  bodyText?: string;
  organizationalUnitId?: string;
  organizationalUnitName?: string;
  status?: number;
  statusName?: string;
  createAt?: string; // ISO date string
  createBy?: string;
  lastUpdateAt?: string; // ISO date string
  lastUpdateBy?: string;
}

export interface CorrespondenceTemplatesPayload {
  id?: string;
  templateName?: string;
  subject: string;
  bodyText?: string;
  organizationalUnitId?: string;
  createBy?: string;
}

export interface CorrespondenceTemplatesList {
  id: string;
  templateName: string;
  organizationalUnitId: string;
  organizationalUnitName: string;
  subject: string;
  bodyText?: string;
  status: number;
  statusName: string;
  createAt: string; // ISO date string
}

export interface CorrespondenceTemplatesQuery {
  page: number;
  pageSize: number;
  templateName: string;
  status: number;
}

export interface CorrespondenceTemplatesResponse {
  items: CorrespondenceTemplatesList[];
  totalCount: number;
}

