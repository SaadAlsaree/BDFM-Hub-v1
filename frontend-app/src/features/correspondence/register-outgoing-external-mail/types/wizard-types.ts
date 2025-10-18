// Base wizard step props
export interface WizardStepProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

// Step-specific data interfaces
export interface InternalInfoStep {
  recipientExternalEntityId: string;
  recipientSubEntities: string[];
  subject: string;
  bodyText: string;
  secrecyLevel?: number;
  priorityLevel?: number;
  personalityLevel?: number;
  mailNum?: string;
  mailDate: string;
  fileNumberToReuse?: string;
}

export interface LinkingStep {
  refersToPreviousInternalCorrespondenceId: string;
  linkType?: number;
  notes: string;
}

export interface AttachmentsStep {
  attachments: File[];
  attachmentDescriptions: string[];
}

// Complete form data interface
export interface WizardFormData
  extends InternalInfoStep,
    LinkingStep,
    AttachmentsStep {}

// Wizard step enumeration
export enum WizardStep {
  INTERNAL_INFO = 0,
  LINKING = 1,
  ATTACHMENTS = 2
}

// Simplified saving result interface
export interface SaveResult {
  success: boolean;
  correspondenceId?: string;
  errors: string[];
}
