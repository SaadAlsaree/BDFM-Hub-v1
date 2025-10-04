

export interface IResponseList<T> {
  succeeded?: boolean;
  data?: Items<T>;
  message?: string;
  errors?: string[];
  code?: string;
}


export interface IResponse<T> {
  succeeded?: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  code?: string;
}


interface Items<T> {
  items?: T[];
  totalCount?: number;
}