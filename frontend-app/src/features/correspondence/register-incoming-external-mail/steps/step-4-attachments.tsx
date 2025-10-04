'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useWizard } from '../context/wizard-context';
import { WizardStepProps } from '../types/wizard-types';
import {
  attachmentsSchema,
  AttachmentsFormValues
} from '../utils/wizard-schemas';
import { useAuthApi } from '@/hooks/use-auth-api';
import { ExternalCorrespondencePayload } from '@/features/correspondence/types/register-incoming-external-mail';
import { Spinner } from '@/components/spinner';
import AttachmentForm from '@/features/attachments/components/attachment-form';
import {
  CorrespondenceSaver,
  CorrespondenceSaveData
} from '../utils/correspondence-saver';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Interface for attachment files with description
interface AttachmentFile extends File {
  description?: string;
}

export function StepAttachments({ onPrevious, isFirstStep }: WizardStepProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    formData,
    updateFormData,
    initialData,
    selectedCorrespondence,
    isSubmitting,
    setIsSubmitting,
    resetWizard
  } = useWizard();
  const { authApiCall } = useAuthApi();
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationAlerts, setShowValidationAlerts] = useState(false);

  const form = useForm<AttachmentsFormValues>({
    resolver: zodResolver(attachmentsSchema),
    defaultValues: {
      attachments: formData.attachments || [],
      attachmentDescriptions: formData.attachmentDescriptions || []
    },
    mode: 'onChange'
  });

  // Comprehensive validation function for all steps
  const validateAllSteps = (): string[] => {
    const errors: string[] = [];

    // Step 1: External Information Validation
    if (!formData.externalReferenceNumber?.trim()) {
      errors.push('رقم كتاب الجهة الخارجية مطلوب');
    }
    if (!formData.externalReferenceDate?.trim()) {
      errors.push('تاريخ كتاب الجهة الخارجية مطلوب');
    } else {
      // Check if external reference date is in the future
      const externalDate = new Date(formData.externalReferenceDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today

      if (externalDate > today) {
        errors.push('تاريخ كتاب الجهة الخارجية لا يمكن أن يكون في المستقبل');
      }
    }
    if (!formData.originatingExternalEntityId?.trim()) {
      errors.push('الجهة الخارجية المنشئة مطلوبة');
    }
    // if (

    // Step 2: Internal Information Validation
    if (!formData.subject?.trim()) {
      errors.push('موضوع الكتاب مطلوب');
    }
    if (!formData.mailDate?.trim()) {
      errors.push('التاريخ الداخلي مطلوب');
    }
    if (formData.secrecyLevel === undefined || formData.secrecyLevel === null) {
      errors.push('مستوى السرية مطلوب');
    }
    if (
      formData.priorityLevel === undefined ||
      formData.priorityLevel === null
    ) {
      errors.push('مستوى الأولوية مطلوب');
    }
    if (
      formData.personalityLevel === undefined ||
      formData.personalityLevel === null
    ) {
      errors.push('مستوى الشخصية مطلوب');
    }
    if (!formData.externalEntityId?.trim()) {
      errors.push('الجهة الخارجية المستهدفة مطلوبة');
    }
    if (!formData.bodyText?.trim()) {
      errors.push('نص الكتاب مطلوب');
    }

    // Step 3: Linking Validation (optional but if provided, must be complete)
    if (
      formData.refersToPreviousInternalCorrespondenceId &&
      !formData.linkType
    ) {
      errors.push('نوع الربط مطلوب عند ربط الكتاب بمراسلة سابقة');
    }

    // Step 4: Attachments Validation (optional but validate if provided)
    const currentAttachments = form.getValues('attachments');
    if (currentAttachments && currentAttachments.length > 0) {
      const invalidFiles = currentAttachments.filter(
        (file) => !file.name || file.size === 0
      );
      if (invalidFiles.length > 0) {
        errors.push('يوجد ملفات غير صالحة في المرفقات');
      }
    }

    return errors;
  };

  // Handle attachment changes from AttachmentForm
  const handleAttachmentsChange = (newAttachments: AttachmentFile[]) => {
    // Update the form values
    form.setValue('attachments', newAttachments);

    // Update the wizard context
    updateFormData({
      attachments: newAttachments,
      attachmentDescriptions: newAttachments.map(
        (file) => file.description || ''
      )
    });

    // Clear validation errors when user makes changes
    if (validationErrors.length > 0) {
      setValidationErrors([]);
      setShowValidationAlerts(false);
    }
  };

  const handleRegisterAnother = () => {
    setIsSuccess(false);
    setValidationErrors([]);
    setShowValidationAlerts(false);
    resetWizard();
  };

  const handleGoBack = () => {
    router.push('/correspondence/register-incoming-external-mail');

    setValidationErrors([]);
    setShowValidationAlerts(false);
    onPrevious();
  };

  const handleGoToList = () => {
    router.push('/correspondence/incoming-external-book-list');
  };

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validate all steps before submission
      const validationErrors = validateAllSteps();
      if (validationErrors.length > 0) {
        setValidationErrors(validationErrors);
        setShowValidationAlerts(true);
        setIsSubmitting(false);
        toast.error('يرجى تصحيح الأخطاء التالية قبل المتابعة');
        return;
      }

      // Get the current form data including attachments
      const currentAttachments = form.getValues('attachments');
      const completeFormData = {
        ...formData,
        attachments: currentAttachments,
        attachmentDescriptions: currentAttachments.map(
          (file: AttachmentFile) => file.description || ''
        )
      };

      if (initialData) {
        // Update existing correspondence - Note: there's no update endpoint, only create
        toast.info('تحديث المراسلة الموجودة غير متاح حالياً');
        return;
      }

      // Prepare correspondence data
      const correspondenceData: ExternalCorrespondencePayload = {
        externalReferenceNumber: completeFormData.externalReferenceNumber || '',
        externalReferenceDate: completeFormData.externalReferenceDate || '',
        originatingExternalEntityId:
          completeFormData.originatingExternalEntityId || '',
        originatingSubEntities: completeFormData.originatingSubEntities || [],
        subject: completeFormData.subject || '',
        bodyText: completeFormData.bodyText || '',
        secrecyLevel: completeFormData.secrecyLevel || 0,
        priorityLevel: completeFormData.priorityLevel || 0,
        personalityLevel: completeFormData.personalityLevel || 0,
        externalEntityId: completeFormData.externalEntityId || '',
        mailNum: completeFormData.mailNum || '', // Use from form or auto-generate in backend
        mailDate:
          completeFormData.mailDate || new Date().toISOString().split('T')[0],
        createdByUserId: session?.user?.id || '',
        fileNumberToReuse: completeFormData.fileNumberToReuse || ''
      };

      // Prepare linking data (if applicable)
      let linkingData;
      if (
        selectedCorrespondence &&
        completeFormData.refersToPreviousInternalCorrespondenceId
      ) {
        linkingData = {
          linkedCorrespondenceId:
            completeFormData.refersToPreviousInternalCorrespondenceId,
          linkType: completeFormData.linkType || 1, // Default to RefersTo if not specified
          notes:
            completeFormData.notes ||
            'ربط من معالج تسجيل الكتب الواردة الخارجية'
        };
      }

      // Prepare save data
      const saveData: CorrespondenceSaveData = {
        correspondenceData,
        linkingData,
        attachmentsData: currentAttachments
      };

      // Initialize the saver and execute save
      const saver = new CorrespondenceSaver(
        authApiCall,
        session?.user?.id || ''
      );
      const result = await saver.save(saveData);

      if (result.success) {
        // Show success message and set success state
        toast.success('تم تسجيل الكتاب بنجاح!');
        setIsSuccess(true);
      } else {
        // Show specific error messages
        result.errors.forEach((error) => {
          toast.error(error);
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error({ error });
      toast.error('حدث خطأ غير متوقع!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-right text-xl font-semibold text-zinc-900 dark:text-zinc-100'>
          {isSuccess ? 'تم التسجيل بنجاح!' : 'المرفقات'}
        </h2>
        <p className='text-right text-sm text-zinc-600 dark:text-zinc-400'>
          {isSuccess
            ? 'تم تسجيل الكتاب بنجاح. ماذا تريد أن تفعل الآن؟'
            : 'أضف المرفقات المتعلقة بالكتاب (اختياري)'}
        </p>
      </div>

      <Separator />

      {/* Validation Alerts */}
      {showValidationAlerts && validationErrors.length > 0 && (
        <Alert variant='destructive' className='mb-6'>
          <XCircle className='h-4 w-4' />
          <AlertDescription>
            <div className='space-y-2'>
              <p className='font-semibold'>يرجى تصحيح الأخطاء التالية:</p>
              <ul className='list-inside list-disc space-y-1 text-sm'>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isSuccess ? (
        // Success Options
        <div className='flex flex-col items-center space-y-6 py-8'>
          <div className='space-y-6 text-center'>
            <div className='flex justify-center'>
              <CheckCircle className='h-16 w-16 text-green-500' />
            </div>
            <div className='space-y-2'>
              <h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100'>
                تم تسجيل الكتاب بنجاح !
              </h3>
              <p className='text-sm text-zinc-600 dark:text-zinc-400'>
                يمكنك الآن تسجيل كتاب جديدة أو العودة إلى قائمة الكتب
              </p>
            </div>
            <div className='flex justify-center gap-x-4 space-x-4 space-x-reverse'>
              <Button onClick={handleRegisterAnother} className='px-8 py-2'>
                تسجيل كتاب جديد
              </Button>
              <Button
                variant='outline'
                onClick={handleGoToList}
                className='px-8 py-2'
              >
                العودة إلى القائمة
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Step Validation Summary */}
          <div className='mb-6 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900'>
            <h3 className='mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-100'>
              ملخص حالة الخطوات
            </h3>
            <div className='grid grid-cols-1 gap-3 text-sm md:grid-cols-2'>
              {/* Step 1 Status */}
              <div className='flex items-center space-x-2 space-x-reverse'>
                {formData.externalReferenceNumber &&
                formData.externalReferenceDate &&
                formData.originatingExternalEntityId ? (
                  <CheckCircle className='h-4 w-4 text-green-500' />
                ) : (
                  <XCircle className='h-4 w-4 text-red-500' />
                )}
                <span
                  className={
                    formData.externalReferenceNumber &&
                    formData.externalReferenceDate &&
                    formData.originatingExternalEntityId
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-red-700 dark:text-red-400'
                  }
                >
                  الخطوة 1: المعلومات الخارجية
                </span>
              </div>

              {/* Step 2 Status */}
              <div className='flex items-center space-x-2 space-x-reverse'>
                {formData.subject &&
                formData.mailDate &&
                formData.secrecyLevel !== undefined &&
                formData.priorityLevel !== undefined &&
                formData.personalityLevel !== undefined &&
                formData.externalEntityId?.trim() &&
                formData.bodyText?.trim() ? (
                  <CheckCircle className='h-4 w-4 text-green-500' />
                ) : (
                  <XCircle className='h-4 w-4 text-red-500' />
                )}
                <span
                  className={
                    formData.subject &&
                    formData.mailDate &&
                    formData.secrecyLevel !== undefined &&
                    formData.priorityLevel !== undefined &&
                    formData.personalityLevel !== undefined &&
                    formData.externalEntityId?.trim() &&
                    formData.bodyText?.trim()
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-red-700 dark:text-red-400'
                  }
                >
                  الخطوة 2: المعلومات الداخلية
                </span>
              </div>

              {/* Step 3 Status */}
              <div className='flex items-center space-x-2 space-x-reverse'>
                {!formData.refersToPreviousInternalCorrespondenceId ||
                (formData.refersToPreviousInternalCorrespondenceId &&
                  formData.linkType) ? (
                  <CheckCircle className='h-4 w-4 text-green-500' />
                ) : (
                  <AlertTriangle className='h-4 w-4 text-yellow-500' />
                )}
                <span
                  className={
                    !formData.refersToPreviousInternalCorrespondenceId ||
                    (formData.refersToPreviousInternalCorrespondenceId &&
                      formData.linkType)
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-yellow-700 dark:text-yellow-400'
                  }
                >
                  الخطوة 3: الربط (اختياري)
                </span>
              </div>

              {/* Step 4 Status */}
              <div className='flex items-center space-x-2 space-x-reverse'>
                <CheckCircle className='h-4 w-4 text-green-500' />
                <span className='text-green-700 dark:text-green-400'>
                  الخطوة 4: المرفقات (اختياري)
                </span>
              </div>
            </div>
          </div>

          {/* Use AttachmentForm Component */}
          <AttachmentForm
            onAttachmentsChange={handleAttachmentsChange}
            existingAttachments={formData.attachments || []}
            showSaveButton={false} // We handle saving in the wizard navigation
            title='' // Remove title since we have it above
            description='' // Remove description since we have it above
            maxFiles={10}
            maxFileSize={10} // 10MB
            acceptedFileTypes={[
              '.pdf',
              '.doc',
              '.docx',
              '.jpg',
              '.jpeg',
              '.png'
            ]}
            tableName={1} // Correspondence table
          />

          {/* Navigation Buttons */}
          <div className='flex justify-between pt-6'>
            <Button
              type='button'
              variant='outline'
              onClick={handleGoBack}
              disabled={isFirstStep || isSubmitting}
            >
              السابق
            </Button>
            <Button
              type='button'
              onClick={onSubmit}
              disabled={isSubmitting || validationErrors.length > 0}
              className={
                validationErrors.length > 0
                  ? 'cursor-not-allowed opacity-50'
                  : ''
              }
            >
              {initialData ? 'تحديث المراسلة' : 'تسجيل المراسلة'}
              {isSubmitting && (
                <Spinner variant='default' className='mr-2 h-4 w-4' />
              )}
              {validationErrors.length > 0 && !isSubmitting && (
                <AlertTriangle className='mr-2 h-4 w-4' />
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
