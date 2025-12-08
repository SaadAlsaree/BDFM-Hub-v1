'use client';

import { useState } from 'react';
import { IconUpload, IconX, IconLoader2 } from '@tabler/icons-react';
import Image from 'next/image';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Markdown } from '@/components/ui/markdown';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ocrService } from '../api/ai-tools.service';
import type { OCRRequestPayload, OCRResponse } from '../types/ai-tools';

interface OCRProcessorProps {
  className?: string;
}

// قيم ثابتة للموديل والبرومبت
const OCR_MODEL = 'deepseek-ocr';
const OCR_PROMPT = 'Extract the text in the image.';

export function OCRProcessor({ className }: OCRProcessorProps) {
  const { user, isLoading: isLoadingUser } = useCurrentUser();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OCRResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter((file) =>
      file.type.startsWith('image/')
    );

    if (imageFiles.length !== acceptedFiles.length) {
      toast.error('يرجى اختيار ملفات صور فقط');
    }

    if (imageFiles.length > 0) {
      setFiles((prev) => [...prev, ...imageFiles]);
      setResult(null);
      setError(null);
    }
  };

  const onRemoveFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      if (newFiles.length === 0) {
        setResult(null);
        setError(null);
      }
      return newFiles;
    });
  };

  const onProcess = async () => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    if (files.length === 0) {
      toast.error('يرجى اختيار صورة واحدة على الأقل');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      // تحويل الملفات إلى base64
      const base64Images = await ocrService.filesToBase64(files);

      // التحقق من حجم الصور (قد تكون كبيرة جداً)
      const totalSize = base64Images.reduce((sum, img) => sum + img.length, 0);
      const totalSizeMB = totalSize / (1024 * 1024);

      if (totalSizeMB > 10) {
        toast.warning(
          `حجم الصور كبير جداً (${totalSizeMB.toFixed(2)} MB). قد يستغرق المعالجة وقتاً أطول.`
        );
      }

      // إعداد payload
      const payload: OCRRequestPayload = {
        id: user.id,
        username: user.username,
        userLogin: user.userLogin,
        fullName: user.fullName,
        email: user.email,
        organizationalUnitId: user.organizationalUnitId,
        model: OCR_MODEL,
        prompt: OCR_PROMPT,
        images: base64Images
      };

      // تسجيل معلومات الطلب للمساعدة في التصحيح (بدون الصور)
      console.log('OCR Request Info:', {
        model: payload.model,
        prompt: payload.prompt,
        imagesCount: payload.images.length,
        totalSizeMB: totalSizeMB.toFixed(2),
        userId: payload.id
      });

      // تنفيذ OCR
      const response = await ocrService.performOCRClient(payload);

      if (response && response.success) {
        setResult(response);
        toast.success('تم استخراج النص بنجاح');
      } else {
        // استخراج رسالة الخطأ من الاستجابة
        let errorMessage = 'فشل في استخراج النص من الصورة';

        if (response?.message) {
          errorMessage = response.message;
        } else if (response?.error) {
          // إذا كان الخطأ object، استخرج الرسالة منه
          if (typeof response.error === 'string') {
            errorMessage = response.error;
          } else if (response.error?.message) {
            errorMessage = response.error.message;
          } else if (response.error?.error) {
            errorMessage = response.error.error;
          }
        }

        setError(errorMessage);
        toast.error(errorMessage);

        // عرض تفاصيل إضافية في console للمساعدة في التصحيح
        if (response?.error) {
          console.error('OCR Error Details:', response.error);
        }
      }
    } catch (err: any) {
      // معالجة الأخطاء غير المتوقعة
      let errorMessage = 'حدث خطأ أثناء معالجة الصورة';

      if (err?.response?.data) {
        const errorData = err.response.data;
        if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.error) {
          errorMessage =
            typeof errorData.error === 'string'
              ? errorData.error
              : errorData.error?.message || errorMessage;
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
      console.error({ error: err });
    } finally {
      setIsProcessing(false);
    }
  };

  const onClear = () => {
    setFiles([]);
    setResult(null);
    setError(null);
  };

  if (isLoadingUser) {
    return (
      <Card className={className}>
        <CardContent className='flex items-center justify-center py-12'>
          <IconLoader2 className='text-muted-foreground size-6 animate-spin' />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className='py-12 text-center'>
          <p className='text-muted-foreground'>
            يجب تسجيل الدخول لاستخدام هذه الميزة
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>معالج OCR - استخراج النص من الصور</CardTitle>
        <CardDescription>
          قم بتحميل صورة واحدة أو أكثر واستخرج النص منها باستخدام الذكاء
          الاصطناعي
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* File Upload Area */}
        <div className='space-y-2'>
          <Label>الصور</Label>
          <div
            className='group border-muted-foreground/25 hover:bg-muted/25 relative grid min-h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed px-5 py-2.5 text-center transition'
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.multiple = true;
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                if (target.files) {
                  onDrop(Array.from(target.files));
                }
              };
              input.click();
            }}
          >
            <div className='flex flex-col items-center justify-center gap-4 sm:px-5'>
              <div className='rounded-full border border-dashed p-3'>
                <IconUpload
                  className='text-muted-foreground size-7'
                  aria-hidden='true'
                />
              </div>
              <div className='space-y-px'>
                <p className='text-muted-foreground font-medium'>
                  اضغط لاختيار الصور أو اسحبها هنا
                </p>
                <p className='text-muted-foreground/70 text-sm'>
                  يمكنك اختيار صورة واحدة أو أكثر
                </p>
              </div>
            </div>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className='space-y-2'>
              {files.map((file, index) => (
                <div
                  key={index}
                  className='relative flex items-center space-x-4 rounded-lg border p-3'
                >
                  <div className='relative size-16 shrink-0 overflow-hidden rounded-md'>
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      fill
                      className='object-cover'
                      onLoad={(e) => {
                        URL.revokeObjectURL((e.target as HTMLImageElement).src);
                      }}
                    />
                  </div>
                  <div className='flex flex-1 flex-col gap-1'>
                    <p className='text-foreground/80 line-clamp-1 text-sm font-medium'>
                      {file.name}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => onRemoveFile(index)}
                    disabled={isProcessing}
                    className='size-8 rounded-full'
                  >
                    <IconX className='text-muted-foreground' />
                    <span className='sr-only'>إزالة الملف</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className='flex gap-2'>
          <Button
            onClick={onProcess}
            disabled={isProcessing || files.length === 0}
            className='flex-1'
          >
            {isProcessing ? (
              <>
                <IconLoader2 className='size-4 animate-spin' />
                جاري المعالجة...
              </>
            ) : (
              'معالجة الصور'
            )}
          </Button>
          {files.length > 0 && (
            <Button variant='outline' onClick={onClear} disabled={isProcessing}>
              مسح الكل
            </Button>
          )}
        </div>

        {/* Result */}
        {result && result.success && result.data?.text && (
          <div className='space-y-2'>
            <Label>النتيجة</Label>
            <div className='bg-muted/30 rounded-lg border p-4'>
              <Markdown>{result.data.text}</Markdown>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className='border-destructive/50 bg-destructive/10 space-y-2 rounded-lg border p-4'>
            <p className='text-destructive text-sm font-medium'>خطأ</p>
            <p className='text-destructive/80 text-sm'>{error}</p>
            {result && !result.success && result.error && (
              <details className='mt-2'>
                <summary className='text-destructive/70 hover:text-destructive cursor-pointer text-xs'>
                  تفاصيل إضافية
                </summary>
                <pre className='bg-destructive/5 mt-2 max-h-40 overflow-auto rounded p-2 text-xs'>
                  {JSON.stringify(result.error, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
