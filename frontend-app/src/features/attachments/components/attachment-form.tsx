'use client';

import React, { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { IconUpload, IconX, IconFileText } from '@tabler/icons-react';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/spinner';
import { formatBytes } from '@/lib/utils';
import { useAuthApi } from '@/hooks/use-auth-api';

import { attachmentService } from '../api/attachment.service';

// Schema for attachment form validation
const attachmentSchema = z.object({
  attachments: z.array(z.any()).optional()
});

type AttachmentFormValues = z.infer<typeof attachmentSchema>;

interface AttachmentFile extends File {
  id?: string;
  description?: string;
}

interface AttachmentFormProps {
  primaryTableId?: string;
  tableName?: number;
  onAttachmentsChange?: (attachments: AttachmentFile[]) => void;
  onSave?: (success: boolean) => void;
  existingAttachments?: AttachmentFile[];
  showSaveButton?: boolean;
  title?: string;
  description?: string;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string[];
  disabled?: boolean;
}

const AttachmentForm: React.FC<AttachmentFormProps> = ({
  primaryTableId,
  tableName = 1, // Default table type
  onAttachmentsChange,
  onSave,
  existingAttachments = [],
  showSaveButton = true,
  title = 'المرفقات',
  description = 'أضف المرفقات المتعلقة بالسجل (اختياري)',
  maxFiles = 25,
  maxFileSize = 25,
  acceptedFileTypes = [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.txt',
    '.jpg',
    '.jpeg',
    '.png',
    '.gif'
  ],
  disabled = false
}) => {
  const { data: session } = useSession();
  const { authApiCall } = useAuthApi();
  const [attachments, setAttachments] =
    useState<AttachmentFile[]>(existingAttachments);
  const [attachmentDescriptions, setAttachmentDescriptions] = useState<
    Record<number, string>
  >({});
  const [loading, setLoading] = useState(false);

  const form = useForm<AttachmentFormValues>({
    resolver: zodResolver(attachmentSchema),
    defaultValues: {
      attachments: existingAttachments
    }
  });

  // No longer needed - we'll use FormData directly

  // Handle file upload
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      const fileArray = Array.from(files);

      // Validate file count
      if (attachments.length + fileArray.length > maxFiles) {
        toast.error(`يمكن رفع حد أقصى ${maxFiles} ملفات`);
        return;
      }

      // Validate file sizes and types
      const validFiles: AttachmentFile[] = [];
      for (const file of fileArray) {
        // Check file size (convert MB to bytes)
        if (file.size > maxFileSize * 1024 * 1024) {
          toast.error(
            `حجم الملف ${file.name} يتجاوز الحد المسموح (${maxFileSize}MB)`
          );
          continue;
        }

        // Check file type
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!acceptedFileTypes.includes(fileExtension)) {
          toast.error(`نوع الملف ${file.name} غير مدعوم`);
          continue;
        }

        validFiles.push(file as AttachmentFile);
      }

      if (validFiles.length > 0) {
        const newAttachments = [...attachments, ...validFiles];
        setAttachments(newAttachments);
        onAttachmentsChange?.(newAttachments);
        toast.success(`تم إضافة ${validFiles.length} ملف`);
      }

      // Reset input
      event.target.value = '';
    },
    [attachments, maxFiles, maxFileSize, acceptedFileTypes, onAttachmentsChange]
  );

  // Remove attachment
  const removeAttachment = useCallback(
    (index: number) => {
      const newAttachments = attachments.filter((_, i) => i !== index);
      setAttachments(newAttachments);

      // Remove description for this index
      const newDescriptions = { ...attachmentDescriptions };
      delete newDescriptions[index];
      setAttachmentDescriptions(newDescriptions);

      onAttachmentsChange?.(newAttachments);
    },
    [attachments, attachmentDescriptions, onAttachmentsChange]
  );

  // Update attachment description
  const updateDescription = useCallback(
    (index: number, description: string) => {
      setAttachmentDescriptions((prev) => ({
        ...prev,
        [index]: description
      }));

      // Update the attachment file object
      const updatedAttachments = [...attachments];
      if (updatedAttachments[index]) {
        updatedAttachments[index].description = description;
        setAttachments(updatedAttachments);
        onAttachmentsChange?.(updatedAttachments);
      }
    },
    [attachments, onAttachmentsChange]
  );

  // Save attachments to server
  const onSubmit = async (data: AttachmentFormValues) => {
    if (!primaryTableId || !session?.user?.id) {
      toast.error('معلومات المستخدم أو الجدول غير متوفرة');
      return;
    }

    setLoading(true);

    try {
      let successCount = 0;

      for (let i = 0; i < attachments.length; i++) {
        const file = attachments[i];

        // Skip files that are already saved (have an id)
        if (file.id) {
          successCount++;
          continue;
        }

        try {
          const metadata = {
            primaryTableId,
            tableName,
            description:
              attachmentDescriptions[i] || file.description || file.name,
            createBy: session.user.id
          };

          console.log({ metadata, fileName: file.name, fileSize: file.size });

          const result = await authApiCall(() =>
            attachmentService.createAttachmentFormData(file, metadata)
          );

          if (result?.succeeded) {
            successCount++;
          } else {
            toast.error(`فشل في حفظ الملف: ${file.name}`);
          }
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          toast.error(`خطأ في رفع الملف: ${file.name}`);
        }
      }

      if (successCount === attachments.length) {
        toast.success('تم حفظ جميع المرفقات بنجاح');
        onSave?.(true);
      } else if (successCount > 0) {
        toast.warning(`تم حفظ ${successCount} من ${attachments.length} ملفات`);
        onSave?.(true);
      } else {
        toast.error('فشل في حفظ المرفقات');
        onSave?.(false);
      }
    } catch (error) {
      console.error('Error saving attachments:', error);
      toast.error('حدث خطأ أثناء حفظ المرفقات');
      onSave?.(false);
    } finally {
      setLoading(false);
    }
  };

  // Get file type icon
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <IconFileText className='h-8 w-8 flex-shrink-0 text-red-500' />;
      case 'doc':
      case 'docx':
        return <IconFileText className='h-8 w-8 flex-shrink-0 text-blue-500' />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return (
          <IconFileText className='h-8 w-8 flex-shrink-0 text-green-500' />
        );
      default:
        return <IconFileText className='h-8 w-8 flex-shrink-0 text-gray-500' />;
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-right text-xl font-semibold text-zinc-900 dark:text-zinc-100'>
          {title}
        </h2>
        <p className='text-right text-sm text-zinc-600 dark:text-zinc-400'>
          {description}
        </p>
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {/* File Upload Section */}
          <div className='space-y-4'>
            <div className='flex w-full items-center justify-center'>
              <label
                htmlFor='file-upload'
                className={`flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 ${
                  disabled ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                  <IconUpload className='mb-2 h-8 w-8 text-zinc-500 dark:text-zinc-400' />
                  <p className='mb-2 text-sm text-zinc-500 dark:text-zinc-400'>
                    <span className='font-semibold'>انقر لرفع الملفات</span> أو
                    اسحب الملفات هنا
                  </p>
                  <p className='text-center text-xs text-zinc-500 dark:text-zinc-400'>
                    {acceptedFileTypes.join(', ')} (حد أقصى {maxFileSize}MB لكل
                    ملف)
                  </p>
                  <p className='text-center text-xs text-zinc-500 dark:text-zinc-400'>
                    حد أقصى {maxFiles} ملفات
                  </p>
                </div>
                <input
                  id='file-upload'
                  type='file'
                  multiple
                  disabled={disabled}
                  className='hidden'
                  accept={acceptedFileTypes.join(',')}
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          {/* Attachments List */}
          {attachments.length > 0 && (
            <div className='space-y-4'>
              <h3 className='text-right text-lg font-medium text-zinc-900 dark:text-zinc-100'>
                الملفات المرفقة ({attachments.length})
              </h3>

              <div className='grid gap-4'>
                {attachments.map((file, index) => (
                  <Card key={index} className='p-4'>
                    <CardContent className='p-0'>
                      <div className='flex items-start justify-between space-x-4 space-x-reverse'>
                        <div className='flex flex-1 items-center space-x-3 space-x-reverse'>
                          {getFileIcon(file.name)}
                          <div className='min-w-0 flex-1'>
                            <p className='truncate text-right text-sm font-medium text-zinc-900 dark:text-zinc-100'>
                              {file.name}
                            </p>
                            <p className='text-right text-sm text-zinc-500 dark:text-zinc-400'>
                              {formatBytes(file.size)}
                            </p>
                            <Badge variant='secondary' className='mt-1'>
                              {file.type || 'ملف'}
                            </Badge>
                            {file.id && (
                              <Badge variant='outline' className='mt-1 mr-2'>
                                محفوظ
                              </Badge>
                            )}
                          </div>
                        </div>

                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          disabled={disabled}
                          onClick={() => removeAttachment(index)}
                          className='flex-shrink-0 text-red-500 hover:text-red-700'
                        >
                          <IconX className='h-4 w-4' />
                        </Button>
                      </div>

                      {/* Description Input */}
                      <div className='mt-3'>
                        <FormLabel className='block text-right text-sm font-medium text-zinc-700 dark:text-zinc-300'>
                          وصف الملف (اختياري)
                        </FormLabel>
                        <Input
                          dir='rtl'
                          disabled={disabled}
                          placeholder='أدخل وصف للملف'
                          value={
                            attachmentDescriptions[index] ||
                            file.description ||
                            ''
                          }
                          onChange={(e) =>
                            updateDescription(index, e.target.value)
                          }
                          className='mt-1'
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          {showSaveButton && primaryTableId && (
            <div className='flex justify-end pt-6'>
              <Button
                type='submit'
                disabled={loading || disabled || attachments.length === 0}
              >
                حفظ المرفقات
                {loading && (
                  <Spinner variant='default' className='mr-2 h-4 w-4' />
                )}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default AttachmentForm;
