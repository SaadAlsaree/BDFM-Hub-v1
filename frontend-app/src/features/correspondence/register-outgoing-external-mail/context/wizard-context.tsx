'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { WizardFormData, WizardStep } from '../types/wizard-types';
import { IExternalEntityList } from '@/features/external-entities/types/external-entities';
import { IOrganizationalUnitList } from '@/features/organizational-unit/types/organizational';
import {
  ExternalCorrespondencePayload,
  SearchCorrespondenceList
} from '@/features/correspondence/types/register-incoming-external-mail';
import { IMailFileList } from '@/features/mail-files/types/mail-files';
import { getDefaultFormValues } from '../utils/wizard-schemas';

interface WizardContextType {
  currentStep: WizardStep;
  formData: Partial<WizardFormData>;
  selectedMailFile: IMailFileList | null;
  selectedCorrespondence: SearchCorrespondenceList | null;
  externalEntitiesList: IExternalEntityList[];
  organizationalUnitsList: IOrganizationalUnitList[];
  initialData: ExternalCorrespondencePayload | null;
  pageTitle: string;
  isSubmitting: boolean;
  setCurrentStep: (step: WizardStep) => void;
  updateFormData: (data: Partial<WizardFormData>) => void;
  setSelectedMailFile: (mailFile: IMailFileList | null) => void;
  setSelectedCorrespondence: (
    correspondence: SearchCorrespondenceList | null
  ) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  nextStep: () => void;
  previousStep: () => void;
  isFirstStep: () => boolean;
  isLastStep: () => boolean;
  resetWizard: () => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

interface WizardProviderProps {
  children: ReactNode;
  externalEntitiesList: IExternalEntityList[];
  organizationalUnitsList: IOrganizationalUnitList[];
  initialData: ExternalCorrespondencePayload | null;
  pageTitle: string;
}

export function WizardProvider({
  children,
  externalEntitiesList,
  organizationalUnitsList,
  initialData,
  pageTitle
}: WizardProviderProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(
    WizardStep.INTERNAL_INFO
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<WizardFormData>>(() => {
    if (initialData) {
      return {
        recipientExternalEntityId: initialData.externalEntityId || '',
        recipientSubEntities: [],
        subject: initialData.subject || '',
        bodyText: initialData.bodyText || '',
        secrecyLevel: initialData.secrecyLevel,
        priorityLevel: initialData.priorityLevel,
        personalityLevel: initialData.personalityLevel,
        mailNum: initialData.mailNum || '',
        mailDate:
          initialData.mailDate || new Date().toISOString().split('T')[0],
        refersToPreviousInternalCorrespondenceId: '',
        linkType: undefined,
        notes: '',
        fileNumberToReuse: initialData.fileNumberToReuse || '',
        attachments: [],
        attachmentDescriptions: []
      };
    }
    return getDefaultFormValues();
  });

  const [selectedCorrespondence, setSelectedCorrespondence] =
    useState<SearchCorrespondenceList | null>(null);

  const [selectedMailFile, setSelectedMailFile] =
    useState<IMailFileList | null>(null);

  const updateFormData = (data: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < WizardStep.ATTACHMENTS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > WizardStep.INTERNAL_INFO) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isFirstStep = () => currentStep === WizardStep.INTERNAL_INFO;
  const isLastStep = () => currentStep === WizardStep.ATTACHMENTS;

  const resetWizard = () => {
    setCurrentStep(WizardStep.INTERNAL_INFO);
    setIsSubmitting(false);
    setFormData(getDefaultFormValues());
    setSelectedCorrespondence(null);
    setSelectedMailFile(null);
  };

  const value: WizardContextType = {
    currentStep,
    formData,
    selectedMailFile,
    selectedCorrespondence,
    externalEntitiesList,
    organizationalUnitsList,
    initialData,
    pageTitle,
    isSubmitting,
    setCurrentStep,
    updateFormData,
    setSelectedMailFile,
    setSelectedCorrespondence,
    setIsSubmitting,
    nextStep,
    previousStep,
    isFirstStep,
    isLastStep,
    resetWizard
  };

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}
