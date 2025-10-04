// Main wizard component - primary export
export { default as RegisterOutgoingExternalMailWizard } from './register-outgoing-external-mail-wizard';

// Context and hooks for external usage
export { WizardProvider, useWizard } from './context/wizard-context';

// Types that might be needed externally
export type { WizardFormData, WizardStep } from './types/wizard-types';

// Schemas and utilities that might be needed externally
export * from './utils/wizard-schemas';
export { CorrespondenceSaver } from './utils/correspondence-saver'; 