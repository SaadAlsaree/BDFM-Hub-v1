import { IResponseList } from '@/types/response';
import { UserCorrespondenceInteraction } from '@/features/correspondence/types/register-incoming-external-mail';

export interface ForwardedCorrespondenceItem {
    correspondenceId: string;
    workflowStepId: string;
    subject: string;
    correspondenceType: number;
    correspondenceStatus: number;
    correspondenceStatusName: string;
    correspondenceTypeName: string;
    externalReferenceNumber: string;
    externalReferenceDate: string;
    mailNum: string;
    mailDate: string;
    createdByUnitName: string;
    priorityLevel: number;
    priorityLevelName: string;
    secrecyLevel: number;
    secrecyLevelName: string;
    receivedDate: string;
    dueDate: string;
    status: number;
    workflowStepStatusName: string;
    statusName: string;
    fileId: string | null;
    fileNumber: string | null;
    isDraft: boolean;
    userCorrespondenceInteraction: UserCorrespondenceInteraction;
    workflowSteps: unknown[];
}

export type ForwardedCorrespondenceResponse = IResponseList<ForwardedCorrespondenceItem>;

















