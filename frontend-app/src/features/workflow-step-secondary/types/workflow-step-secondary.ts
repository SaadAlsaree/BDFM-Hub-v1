export interface WorkflowStepSecondaryCreate {
  stepId: string;
  recipientType: RecipientTypeEnum;
  recipientId: string;
  purpose: string;
  instructionText: string;
}

export interface WorkflowStepSecondaryUpdate {
  id: string;
  stepId: string;
  recipientType: number; // You can replace with RecipientTypeEnum if defined
  recipientId: string;
  purpose: string;
  instructionText: string;
}

export enum RecipientTypeEnum {
  User = 1, // مستخدم
  Unit = 2, // جهة
  ExternalEntity = 3 // جهة خارجية
}

export const RecipientTypeDisplay: Record<RecipientTypeEnum, string> = {
  [RecipientTypeEnum.User]: 'مستخدم',
  [RecipientTypeEnum.Unit]: 'جهة',
  [RecipientTypeEnum.ExternalEntity]: 'جهة خارجية'
};
