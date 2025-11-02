export interface LeaveWorkflowStep {
    id?: string;
    leaveRequestId?: string;
    leaveRequestNumber?: string;
    actionType?: number;
    actionTypeName?: string;
    fromUserId?: string;
    fromUserName?: string;
    fromUnitId?: string;
    fromUnitName?: string;
    toPrimaryRecipientType?: number;
    toPrimaryRecipientTypeName?: string;
    toPrimaryRecipientId?: string;
    toPrimaryRecipientName?: string;
    instructionText?: string;
    dueDate?: string;
    status?: number;
    workflowStepStatusName?: string;
    isTimeSensitive?: boolean;
    isActive?: boolean;
    sequence?: number;
    activatedAt?: string;
    completedAt?: string;
    createAt?: string;
    createBy?: string;
    lastUpdateAt?: string;
    lastUpdateBy?: string;
    interactions?: LeaveWorkflowStepInteraction[];
    recipientActions?: LeaveRecipientActionLog[];
}

export interface LeaveWorkflowStepInteraction {
    id?: string;
    leaveWorkflowStepId?: string;
    interactingUserId?: string;
    interactingUserName?: string;
    isRead?: boolean;
    readAt?: string;
}

export interface LeaveRecipientActionLog {
    id?: string;
    leaveWorkflowStepId?: string;
    actionTakenByUnitId?: string;
    actionTakenByUnitName?: string;
    actionTakenByUserId?: string;
    actionTakenByUserName?: string;
    actionTimestamp?: string;
    actionDescription?: string;
    notes?: string;
    internalActionType?: number;
    internalActionTypeName?: string;
}

export interface CreateLeaveWorkflowStepPayload {
    leaveRequestId: string;
    actionType: number;
    toPrimaryRecipientType: number;
    toPrimaryRecipientId: string;
    instructionText?: string;
    dueDate?: string;
    status?: number;
    isTimeSensitive?: boolean;
}

export interface UpdateLeaveWorkflowStepStatusPayload {
    id: string;
    status: number;
}

export interface CompleteLeaveWorkflowStepPayload {
    id: string;
}

export enum WorkflowStepStatus {
    Pending = 1,
    InProgress = 2,
    Completed = 3,
    Rejected = 4,
    Delegated = 5
}

export const WorkflowStepStatusDisplay: Record<WorkflowStepStatus, string> = {
    [WorkflowStepStatus.Pending]: 'قيد الانتظار',
    [WorkflowStepStatus.InProgress]: 'قيد التنفيذ',
    [WorkflowStepStatus.Completed]: 'مكتمل',
    [WorkflowStepStatus.Rejected]: 'مرفوض',
    [WorkflowStepStatus.Delegated]: 'تعيين'
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
    [ActionTypeEnum.RegisterIncoming]: 'تسجيل الوارد',
    [ActionTypeEnum.RequestApproval]: 'طلب الموافقة',
    [ActionTypeEnum.Action]: 'إجراء لازمة',
    [ActionTypeEnum.Reject]: 'رفض',
    [ActionTypeEnum.Return]: 'إرجاع',
    [ActionTypeEnum.Send]: 'إرسال',
    [ActionTypeEnum.Archive]: 'أرشيف',
    [ActionTypeEnum.TakeUnderConsideration]: 'وضع تحت اليد',
    [ActionTypeEnum.RequestInformation]: 'طلب معلومات',
    [ActionTypeEnum.SendToExternalReferral]: 'إرسال إلى جهة خارجية',
    [ActionTypeEnum.SendToInternalReferral]: 'إرسال إلى جهة داخلية'
};

export enum RecipientTypeEnum {
    User = 1,
    Unit = 2,
    ExternalEntity = 3
}

export const RecipientTypeDisplay: Record<RecipientTypeEnum, string> = {
    [RecipientTypeEnum.User]: 'مستخدم',
    [RecipientTypeEnum.Unit]: 'جهة',
    [RecipientTypeEnum.ExternalEntity]: 'جهة خارجية'
};

export enum InternalActionTypeEnum {
    Referral = 1,
    Answer = 2,
    Reject = 3
}

export const InternalActionTypeDisplay: Record<
    InternalActionTypeEnum,
    string
> = {
    [InternalActionTypeEnum.Referral]: 'إعادة إحالة',
    [InternalActionTypeEnum.Answer]: 'إجابة',
    [InternalActionTypeEnum.Reject]: 'رفض'
};

