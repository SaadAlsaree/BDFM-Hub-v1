export interface IOrganizationalUnitList {
    id?: string;
    unitName?: string;
    unitCode?: string;
    unitDescription?: string;
    parentUnitId?: string;
    parentUnitName?: string;
    unitLevel?: number;
    canReceiveExternalMail?: boolean;
    canSendExternalMail?: boolean;
    status?: number;
    statusName?: string;
    createAt?: string; // ISO date string
    unitType?: number;
    unitTypeName?: string;
}

export interface IOrganizationalUnitDetails {
    id?: string;
    unitName?: string;
    unitCode?: string;
    unitDescription?: string;
    parentUnitId?: string;
    parentUnitName?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    unitLogo?: string;
    unitLevel?: number;
    canReceiveExternalMail?: boolean;
    canSendExternalMail?: boolean;
    status?: number;
    statusName?: string;
    createdAt?: string; // ISO date string
    createdBy?: string;
    updatedAt?: string; // ISO date string
    updatedBy?: string;
    unitType?: number;
    unitTypeName?: string;
}

export interface IOrganizationalUnitQuery {
    page: number;
    pageSize: number;
    searchText?: string;
    status?: number;
    parentUnitId?: string;
}

export interface IOrganizationalUnitTree {
    id?: string; // UUID
    unitName?: string;
    unitCode?: string;
    parentUnitId?: string; // UUID
    email?: string;
    phoneNumber?: string;
    address?: string;
    unitLogo?: string;
    unitLevel?: number;
    canReceiveExternalMail?: boolean;
    canSendExternalMail?: boolean;
    unitType?: number;
    unitTypeName?: string;
    children?: IOrganizationalUnitTree[]; // Array of child unit IDs
}


// create or update organizational unit
export interface CreateOrganizationalUnitPayload {
    id?: string;
    unitName?: string;
    unitCode?: string;
    unitDescription?: string;
    parentUnitId?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    country?: string;
    unitLogo?: string;
    unitLevel?: number;
    canReceiveExternalMail?: boolean;
    canSendExternalMail?: boolean;
    unitType?: number;
}

export enum UnitType {
    DEPARTMENT = 1,
    DIRECTORATE = 2,
    DIVISION = 3,
    BRANCH = 4,
    OFFICE = 5
}


export const UnitTypeDisplay: Record<UnitType, string> = {
    [UnitType.DEPARTMENT]: "دائرة",
    [UnitType.DIRECTORATE]: "مديرية",
    [UnitType.DIVISION]: "قسم",
    [UnitType.BRANCH]: "شعبة",
    [UnitType.OFFICE]: "مكتب"
};



export interface IOrganizationalUnitResponse {
    items: IOrganizationalUnitList[];
    totalCount: number;
}
