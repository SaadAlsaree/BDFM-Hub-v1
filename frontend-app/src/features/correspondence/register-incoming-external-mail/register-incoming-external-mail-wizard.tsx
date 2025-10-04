'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WizardProvider, useWizard } from './context/wizard-context';
import { WizardProgress } from './components/wizard-progress';
import { StepExternalInfo } from './steps/step-1-external-info';
import { StepInternalInfo } from './steps/step-2-internal-info';
import { StepLinking } from './steps/step-3-linking';
import { StepAttachments } from './steps/step-4-attachments';
import { WizardStep } from './types/wizard-types';
import { IExternalEntityList } from '@/features/external-entities/types/external-entities';
import { IOrganizationalUnitList } from '@/features/organizational-unit/types/organizational';
import { ExternalCorrespondencePayload } from '@/features/correspondence/types/register-incoming-external-mail';
import PageContainer from '@/components/layout/page-container';

interface RegisterIncomingExternalMailWizardProps {
  externalEntitiesList: IExternalEntityList[];
  organizationalUnitsList: IOrganizationalUnitList[];
  initialData: ExternalCorrespondencePayload | null;
  pageTitle: string;
}

function WizardContent() {
  const {
    currentStep,
    nextStep,
    previousStep,
    isFirstStep,
    isLastStep,
    pageTitle
  } = useWizard();

  const stepProps = {
    onNext: nextStep,
    onPrevious: previousStep,
    isFirstStep: isFirstStep(),
    isLastStep: isLastStep()
  };

  const renderStep = () => {
    switch (currentStep) {
      case WizardStep.EXTERNAL_INFO:
        return <StepExternalInfo {...stepProps} />;
      case WizardStep.INTERNAL_INFO:
        return <StepInternalInfo {...stepProps} />;
      case WizardStep.LINKING:
        return <StepLinking {...stepProps} />;
      case WizardStep.ATTACHMENTS:
        return <StepAttachments {...stepProps} />;
      default:
        return <StepExternalInfo {...stepProps} />;
    }
  };

  return (
    <PageContainer scrollable>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='text-right text-2xl font-bold'>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <WizardProgress />
          {renderStep()}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

export default function RegisterIncomingExternalMailWizard({
  externalEntitiesList,
  organizationalUnitsList,
  initialData,
  pageTitle
}: RegisterIncomingExternalMailWizardProps) {
  return (
    <WizardProvider
      externalEntitiesList={externalEntitiesList}
      organizationalUnitsList={organizationalUnitsList}
      initialData={initialData}
      pageTitle={pageTitle}
    >
      <WizardContent />
    </WizardProvider>
  );
}
