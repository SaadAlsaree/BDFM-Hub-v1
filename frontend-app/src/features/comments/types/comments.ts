export interface ICommentList {
    id: string;
    correspondenceId: string;
    text: string;
    workflowStepId: string;
    parentCommentId: string;
    visibility: number;
    userId: string;
    employeeName: string;
    userLogin: string;
    employeeUnitName: string;
    employeeUnitCode: string;
    isEdited: boolean;
    canEdit: boolean;
    canDelete: boolean;
    createAt: string; // ISO date string
    createBy: string;
    status: number;
    statusName: string;
    replies: ICommentList[];
}


export interface ICommentDetails {
    id: string;
    correspondenceId: string;
    text: string;
    workflowStepId: string;
    parentCommentId: string;
    visibility: number;
    userId: string;
    employeeName: string;
    userLogin: string;
    employeeUnitName: string;
    employeeUnitCode: string;
    isEdited: boolean;
    canEdit: boolean;
    canDelete: boolean;
    createAt: string; // ISO 8601 date string
    createBy: string;
    status: number;
    statusName: string;
    repliesCount: number;
}

export interface ICommentCreate {
    correspondenceId?: string;
    text: string;
    workflowStepId?: string;
    parentCommentId?: string;
    visibility?: number;
}

export interface ICommentUpdate {
    id: string;         // UUID
    text: string;
    visibility: number;
}

export interface ICommentDelete {
    id: string;         // UUID
}


export enum CommentVisibility {
    /**
     * كل الموظفين
     * All internal users with access to the correspondence
     */
    InternalUsers = 0,

    /**
     * جهة معينة
     * Specific units only
     */
    SpecificUnits = 1,

    /**
     * خاص بالكاتب ومن تم الإشارة إليهم
     * Private to author and mentioned users
     */
    PrivateToAuthorAndMentions = 2
}

export const CommentVisibilityLabels: Record<CommentVisibility, string> = {
    [CommentVisibility.InternalUsers]: "كل الموظفين",
    [CommentVisibility.SpecificUnits]: "جهة معينة",
    [CommentVisibility.PrivateToAuthorAndMentions]: "خاص بالكاتب ومن تم الإشارة إليهم"
};
