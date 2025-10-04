'use client';

import { cn } from '@/lib/utils';
import { WizardStep } from '../types/wizard-types';
import { useWizard } from '../context/wizard-context';

const steps = [
  {
    id: WizardStep.INTERNAL_INFO,
    title: 'معلومات الكتاب الصادر',
    description: 'تفاصيل الكتاب والجهة المستقبلة'
  },
  {
    id: WizardStep.LINKING,
    title: 'ربط الكتاب',
    description: 'ربط بكتاب أو ملف آخر'
  },
  {
    id: WizardStep.ATTACHMENTS,
    title: 'المرفقات',
    description: 'إضافة المرفقات'
  }
];

export function WizardProgress() {
  const { currentStep, setCurrentStep } = useWizard();

  return (
    <nav aria-label='Progress' className='mb-8'>
      <div className='flex items-center justify-center space-x-5 space-x-reverse'>
        {steps.map((step, stepIdx) => (
          <li key={step.id} className='flex items-center'>
            {stepIdx !== 0 && (
              <div
                className={cn(
                  'hidden h-0.5 w-24 sm:block',
                  step.id <= currentStep
                    ? 'bg-primary'
                    : 'bg-zinc-200 dark:bg-zinc-700'
                )}
              />
            )}
            <button
              onClick={() => setCurrentStep(step.id)}
              className={cn(
                'group relative flex items-center',
                step.id <= currentStep ? 'cursor-pointer' : 'cursor-default'
              )}
            >
              <span className='flex items-center px-6 py-4 text-sm font-medium'>
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2',
                    step.id === currentStep
                      ? 'border-primary bg-primary text-white'
                      : step.id < currentStep
                        ? 'border-primary bg-primary text-white'
                        : 'border-zinc-300 bg-white text-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                  )}
                >
                  {step.id < currentStep ? (
                    <svg
                      className='h-6 w-6'
                      viewBox='0 0 24 24'
                      fill='currentColor'
                    >
                      <path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' />
                    </svg>
                  ) : (
                    <span>{step.id + 1}</span>
                  )}
                </span>
                <div className='mr-4 flex min-w-0 flex-col text-right'>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      step.id === currentStep
                        ? 'text-primary'
                        : 'text-zinc-500 dark:text-zinc-400'
                    )}
                  >
                    {step.title}
                  </span>
                  <span className='text-xs text-zinc-500 dark:text-zinc-400'>
                    {step.description}
                  </span>
                </div>
              </span>
            </button>
          </li>
        ))}
      </div>
    </nav>
  );
}
