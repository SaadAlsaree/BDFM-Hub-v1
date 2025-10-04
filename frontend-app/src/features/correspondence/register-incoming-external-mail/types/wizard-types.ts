// Base wizard step props
export interface WizardStepProps {
    onNext: () => void;
    onPrevious: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
}

// Step-specific data interfaces
export interface ExternalInfoStep {
    externalReferenceNumber: string;
    externalReferenceDate: string;
    originatingExternalEntityId: string;
    originatingSubEntities: string[];
}

export interface InternalInfoStep {
    subject: string;
    bodyText: string;
    secrecyLevel?: number;
    priorityLevel?: number;
    personalityLevel?: number;
    externalEntityId?: string;
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
export interface WizardFormData extends ExternalInfoStep, InternalInfoStep, LinkingStep, AttachmentsStep { }

// Wizard step enumeration
export enum WizardStep {
    EXTERNAL_INFO = 0,
    INTERNAL_INFO = 1,
    LINKING = 2,
    ATTACHMENTS = 3
}

// Simplified saving result interface
export interface SaveResult {
    success: boolean;
    correspondenceId?: string;
    errors: string[];
} 