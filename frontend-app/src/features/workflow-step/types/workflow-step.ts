import { CorrespondenceTypeEnum } from "@/features/correspondence/types/register-incoming-external-mail";


export interface WorkflowStepInput {
    correspondenceId?: string;
    actionType?: ActionTypeEnum;
    toPrimaryRecipientType?: RecipientTypeEnum;
    toPrimaryRecipientId?: string;
    instructionText?: string;
    dueDate: Date; // ISO date string
    status?: WorkflowStepStatus;
    isTimeSensitive?: boolean;
}

export interface WorkflowStepBulkInsert {
    correspondenceId: string;
    workflowSteps: WorkflowStepBulkItem[];
}

export interface WorkflowStepBulkItem {
    actionType: ActionTypeEnum;
    toPrimaryRecipientType: RecipientTypeEnum;
    toPrimaryRecipientId: string;
    instructionText: string;
    dueDate: string; // ISO date string
    status: WorkflowStepStatus;
    isTimeSensitive: boolean;
}


export interface LogRecipientInternalActionInput {
    workflowStepId?: string;
    actionTimestamp?: Date; // ISO 8601 string
    actionDescription?: string;
    notes?: string;
    internalActionType?: InternalActionTypeEnum;
}

export interface UpdateStatusInput {
    workflowStepId?: string;
    status?: WorkflowStepStatus;
    correspondenceType?: CorrespondenceTypeEnum | undefined;
    notes?: string;
}





export enum RecipientTypeEnum {
    User = 1,           // مستخدم
    Unit = 2,           // جهة
    ExternalEntity = 3  // جهة خارجية
}

export const RecipientTypeDisplay: Record<RecipientTypeEnum, string> = {
    [RecipientTypeEnum.User]: "مستخدم",
    [RecipientTypeEnum.Unit]: "جهة",
    [RecipientTypeEnum.ExternalEntity]: "جهة خارجية"
};

export enum WorkflowStepStatus {
    Pending = 1,
    InProgress = 2,
    Completed = 3,
    Rejected = 4,
    Delegated = 5,

}


export const WorkflowStepStatusDisplay: Record<WorkflowStepStatus, string> = {
    [WorkflowStepStatus.Pending]: "قيد الانتظار",
    [WorkflowStepStatus.InProgress]: "قيد التنفيذ",
    [WorkflowStepStatus.Completed]: "مكتمل",
    [WorkflowStepStatus.Rejected]: "مرفوض",
    [WorkflowStepStatus.Delegated]: "تعيين",

};


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
    SendToInternalReferral = 11
}



export const ActionTypeDisplay: Record<ActionTypeEnum, string> = {
    [ActionTypeEnum.RegisterIncoming]: "تسجيل الوارد",
    [ActionTypeEnum.RequestApproval]: "طلب الموافقة",
    [ActionTypeEnum.Action]: "أجراء الازم",
    [ActionTypeEnum.Reject]: "رفض",
    [ActionTypeEnum.Return]: "إرجاع",
    [ActionTypeEnum.Send]: "إرسال",
    [ActionTypeEnum.Archive]: "أرشيف",
    [ActionTypeEnum.TakeUnderConsideration]: "وضع تحت اليد",
    [ActionTypeEnum.RequestInformation]: "طلب معلومات",
    [ActionTypeEnum.SendToExternalReferral]: "إرسال إلى جهة خارجية",
    [ActionTypeEnum.SendToInternalReferral]: "إرسال إلى جهة داخلية"
};




export enum InternalActionTypeEnum {
    Referral = 1, // إعادة إحالة
    Answer = 2,   // أجابة
    Reject = 3    // رفض
}


export const InternalActionTypeDisplay: Record<InternalActionTypeEnum, string> = {
    [InternalActionTypeEnum.Referral]: "إعادة إحالة",
    [InternalActionTypeEnum.Answer]: "أجابة",
    [InternalActionTypeEnum.Reject]: "رفض"
};

