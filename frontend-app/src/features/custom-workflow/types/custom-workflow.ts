// Types for Custom Workflow API response
// JSON example converted to TypeScript interfaces
// Types for Custom Workflow API responses
// Contains both list (paged) response types and single-item detail response types

/** A single custom workflow item (used in list responses) */
// Types for Custom Workflow API response
// JSON example converted to TypeScript interfaces
// Types for Custom Workflow API responses
// Contains both list (paged) response types and single-item detail response types

/** A single custom workflow item (used in list responses) */
export interface CustomWorkflowItem {
    id: string;
    workflowName: string;
    triggeringUnitId: string | null;
    triggeringCorrespondenceType: CorrespondenceTypeEnum;
    triggeringCorrespondenceTypeName: string;
    description: string;
    isEnabled: boolean;
    createAt: string; // ISO datetime string
    lastUpdateAt: string | null;
    createBy: string;
    lastUpdateBy: string | null;
    status: number;
    statusName: string;
}

/** Container for paged/list data */
export interface CustomWorkflowData {
    items: CustomWorkflowItem[];
    totalCount: number;
}

/** Root API response for list endpoints */
export interface CustomWorkflowResponse {
    succeeded: boolean;
    data: CustomWorkflowData;
    message: string;
    errors: string[];
    code: string;
}

/** A single workflow step in the detailed workflow response */
export interface CustomWorkflowStep {
    id: string;
    workflowId: string;
    stepOrder: number;
    actionType: ActionTypeEnum;
    actionTypeName: string;
    targetType: CustomWorkflowTargetTypeEnum;
    targetTypeName: string;
    targetIdentifier: string | null;
    targetIdentifierName: string | null;
    defaultInstructionText: string | null;
    defaultDueDateOffsetDays: number | null;
}

/** Detailed workflow data (single object with steps) */
export interface CustomWorkflowDetailData {
    id: string;
    workflowName: string;
    triggeringUnitId: string | null;
    triggeringUnitName?: string | null;
    triggeringCorrespondenceType: CorrespondenceTypeEnum;
    triggeringCorrespondenceTypeName: string;
    description: string | null;
    isEnabled: boolean;
    createAt: string; // ISO datetime string
    lastUpdateAt: string | null;
    createBy: string;
    lastUpdateBy: string | null;
    status: number;
    statusName: string;
    steps: CustomWorkflowStep[];
}

/** Root API response for single-workflow detail endpoints */
export interface CustomWorkflowDetailResponse {
    succeeded: boolean;
    data: CustomWorkflowDetailData;
    message: string;
    errors: string[];
    code: string;
}

// Example usage:
// import { CustomWorkflowDetailResponse } from './types/custom-workflow';
// const resp: CustomWorkflowDetailResponse = await api.get('/custom-workflows/{id}');
// const steps = resp.data.steps;

/** Payload used for create or update (upsert) of a workflow */
export interface CustomWorkflowUpsertDto {
    /** Optional on create; required for update */
    id?: string;
    workflowName: string;
    triggeringUnitId: string | null;
    triggeringCorrespondenceType: CorrespondenceTypeEnum;
    description?: string | null;
    isEnabled: boolean;
}

/** Payload used for create or update (upsert) of a workflow step */
export interface CustomWorkflowStepUpsertDto {
    /** Optional on create; required for update */
    id?: string;
    workflowId: string;
    stepOrder: number;
    actionType: ActionTypeEnum;
    targetType: CustomWorkflowTargetTypeEnum;
    targetIdentifier?: string | null;
    defaultInstructionText?: string | null;
    defaultDueDateOffsetDays?: number | null;
}

/**
 * Correspondence type enum (converted from C# CorrespondenceTypeEnum)
 * Numeric values match the backend enum so they can be used interchangeably.
 */
export enum CorrespondenceTypeEnum {
    Draft = 0,
    IncomingExternal = 1,
    OutgoingExternal = 2,
    IncomingInternal = 3,
    OutgoingInternal = 4,
    Memorandum = 5,
    Reply = 6,
    Public = 7,
}

/** Arabic display names matching the C# [Display(Name = "...")] attributes */
export const CorrespondenceTypeDisplayName: Record<CorrespondenceTypeEnum, string> = {
    [CorrespondenceTypeEnum.Draft]: 'مسودة',
    [CorrespondenceTypeEnum.IncomingExternal]: 'وارد خارجي',
    [CorrespondenceTypeEnum.OutgoingExternal]: 'صادر خارجي',
    [CorrespondenceTypeEnum.IncomingInternal]: 'وارد داخلي',
    [CorrespondenceTypeEnum.OutgoingInternal]: 'صادر داخلي',
    [CorrespondenceTypeEnum.Memorandum]: 'المطالعة',
    [CorrespondenceTypeEnum.Reply]: 'رد',
    [CorrespondenceTypeEnum.Public]: 'اعمام',
};

/** Helper to get display name (returns numeric as string if unknown) */
export function getCorrespondenceTypeDisplayName(value?: CorrespondenceTypeEnum | number | null): string {
    if (value === null || value === undefined) return '';
    // coerce to enum key
    const v = value as CorrespondenceTypeEnum;
    return CorrespondenceTypeDisplayName[v] ?? String(value);
}

/**
 * Action type enum (converted from C# ActionTypeEnum)
 * Numeric values match the backend enum.
 */
export enum ActionTypeEnum {
    RegisterIncoming = 1,
    RequestApproval = 2,
    Action = 3,
    Reject = 4,
    Return = 5,
    Send = 6,
    Archive = 7,
    TakeUnderConsideration = 8,
    RequestInformation = 9,
    SendToExternalReferral = 10,
    SendToInternalReferral = 11,
}

/** Arabic display names matching C# Display attributes for ActionTypeEnum */
export const ActionTypeDisplayName: Record<ActionTypeEnum, string> = {
    [ActionTypeEnum.RegisterIncoming]: 'تسجيل الوارد',
    [ActionTypeEnum.RequestApproval]: 'طلب الموافقة',
    [ActionTypeEnum.Action]: 'أجراء الازم',
    [ActionTypeEnum.Reject]: 'رفض',
    [ActionTypeEnum.Return]: 'إرجاع',
    [ActionTypeEnum.Send]: 'إرسال',
    [ActionTypeEnum.Archive]: 'أرشيف',
    [ActionTypeEnum.TakeUnderConsideration]: 'وضع تحت اليد',
    [ActionTypeEnum.RequestInformation]: 'طلب معلومات',
    [ActionTypeEnum.SendToExternalReferral]: 'إرسال إلى جهة خارجية',
    [ActionTypeEnum.SendToInternalReferral]: 'إرسال إلى جهة داخلية',
};

export function getActionTypeDisplayName(value?: ActionTypeEnum | number | null): string {
    if (value === null || value === undefined) return '';
    const v = value as ActionTypeEnum;
    return ActionTypeDisplayName[v] ?? String(value);
}

/**
 * Target type enum for custom workflow steps (converted from C# CustomWorkflowTargetTypeEnum)
 */
export enum CustomWorkflowTargetTypeEnum {
    SpecificUser = 1,
    SpecificUnit = 2,
    RoleInUnit = 3,
    ManagerOfUnit = 4,
    HeadOfDevice = 5,
}

export const CustomWorkflowTargetTypeDisplayName: Record<CustomWorkflowTargetTypeEnum, string> = {
    [CustomWorkflowTargetTypeEnum.SpecificUser]: 'مستخدم',
    [CustomWorkflowTargetTypeEnum.SpecificUnit]: 'جهة',
    [CustomWorkflowTargetTypeEnum.RoleInUnit]: 'صلاحية في وحدة',
    [CustomWorkflowTargetTypeEnum.ManagerOfUnit]: 'مدير الوحدة',
    [CustomWorkflowTargetTypeEnum.HeadOfDevice]: 'رئيس الجهاز',
};

export function getCustomWorkflowTargetTypeDisplayName(value?: CustomWorkflowTargetTypeEnum | number | null): string {
    if (value === null || value === undefined) return '';
    const v = value as CustomWorkflowTargetTypeEnum;
    return CustomWorkflowTargetTypeDisplayName[v] ?? String(value);
}

export interface ICustomWorkflowQuery {
    page?: number;
    pageSize?: number;

}