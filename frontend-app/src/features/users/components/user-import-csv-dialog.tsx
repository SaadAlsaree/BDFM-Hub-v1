'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import {
  Loader2,
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuthApi } from '@/hooks/use-auth-api';
import { userService } from '@/features/users/api/user.service';
import { ImportFromCsvResponse } from '@/features/users/types/user';
import { useRouter } from 'next/navigation';

interface ImportCsvDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserImportCsvDialog({
  isOpen,
  onClose
}: ImportCsvDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] =
    useState<ImportFromCsvResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { authApiCall } = useAuthApi();
  const router = useRouter();

  const handleFileSelect = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('يجب أن يكون الملف بامتداد .csv');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الملف يجب أن لا يتجاوز 5 ميغابايت');
      return;
    }

    setSelectedFile(file);
    setImportResult(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setImportResult(null);

    try {
      const response = await authApiCall(() =>
        userService.importFromCsv(selectedFile)
      );

      if (response?.data) {
        setImportResult(response.data);

        if (response.data.failedCount === 0) {
          toast.success(
            `تم استيراد ${response.data.successCount} مستخدم بنجاح`
          );
        } else if (response.data.successCount > 0) {
          toast.warning(
            `تم استيراد ${response.data.successCount} من ${response.data.totalRows} مستخدم`
          );
        } else {
          toast.error('فشل استيراد جميع المستخدمين');
        }

        if (response.data.successCount > 0) {
          router.refresh();
        }
      } else {
        toast.error('فشل في استيراد المستخدمين');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء استيراد المستخدمين');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedFile(null);
      setImportResult(null);
      onClose();
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='text-center text-xl font-semibold'>
            استيراد المستخدمين من ملف CSV
          </DialogTitle>
          <DialogDescription className='text-center text-sm text-muted-foreground'>
            يجب أن يحتوي الملف على: البريد الإلكتروني, الاسم, كلمة المرور
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          {/* File Upload Area */}
          {!selectedFile && (
            <div
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className='mb-3 h-10 w-10 text-muted-foreground' />
              <p className='text-sm font-medium'>
                اسحب ملف CSV هنا أو اضغط للاختيار
              </p>
              <p className='mt-1 text-xs text-muted-foreground'>
                الحد الأقصى: 5 ميغابايت
              </p>
              <input
                ref={fileInputRef}
                type='file'
                accept='.csv'
                className='hidden'
                onChange={handleInputChange}
              />
            </div>
          )}

          {/* Selected File Display */}
          {selectedFile && !importResult && (
            <div className='flex items-center gap-3 rounded-lg border bg-muted/50 p-3'>
              <FileSpreadsheet className='h-8 w-8 shrink-0 text-green-600' />
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium'>
                  {selectedFile.name}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {(selectedFile.size / 1024).toFixed(1)} كيلوبايت
                </p>
              </div>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-8 w-8 shrink-0'
                onClick={removeFile}
                disabled={isLoading}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          )}

          {/* Import Results */}
          {importResult && (
            <div className='space-y-3'>
              <div className='grid grid-cols-3 gap-2'>
                <div className='rounded-lg border bg-muted/50 p-3 text-center'>
                  <p className='text-2xl font-bold'>{importResult.totalRows}</p>
                  <p className='text-xs text-muted-foreground'>الإجمالي</p>
                </div>
                <div className='rounded-lg border bg-green-50 p-3 text-center dark:bg-green-950/20'>
                  <p className='text-2xl font-bold text-green-600'>
                    {importResult.successCount}
                  </p>
                  <p className='text-xs text-green-600/80'>ناجح</p>
                </div>
                <div className='rounded-lg border bg-red-50 p-3 text-center dark:bg-red-950/20'>
                  <p className='text-2xl font-bold text-red-600'>
                    {importResult.failedCount}
                  </p>
                  <p className='text-xs text-red-600/80'>فاشل</p>
                </div>
              </div>

              {/* Status Icon */}
              <div className='flex items-center justify-center gap-2'>
                {importResult.failedCount === 0 ? (
                  <>
                    <CheckCircle2 className='h-5 w-5 text-green-600' />
                    <span className='text-sm font-medium text-green-600'>
                      تم الاستيراد بنجاح
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className='h-5 w-5 text-yellow-600' />
                    <span className='text-sm font-medium text-yellow-600'>
                      تم الاستيراد مع بعض الأخطاء
                    </span>
                  </>
                )}
              </div>

              {/* Error Details */}
              {importResult.errors.length > 0 && (
                <div className='max-h-40 overflow-y-auto rounded-lg border bg-red-50 p-3 dark:bg-red-950/10'>
                  <p className='mb-2 text-xs font-semibold text-red-700'>
                    تفاصيل الأخطاء:
                  </p>
                  <ul className='space-y-1'>
                    {importResult.errors.map((error, index) => (
                      <li
                        key={index}
                        className='text-xs text-red-600 dark:text-red-400'
                      >
                        • {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className='pt-2'>
          <Button
            type='button'
            variant='outline'
            onClick={handleClose}
            disabled={isLoading}
            className='w-full sm:w-auto'
          >
            {importResult ? 'إغلاق' : 'إلغاء'}
          </Button>
          {!importResult && (
            <Button
              type='button'
              onClick={handleSubmit}
              disabled={isLoading || !selectedFile}
              className='w-full sm:w-auto'
            >
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  جارٍ الاستيراد...
                </>
              ) : (
                <>
                  <Upload className='mr-2 h-4 w-4' />
                  استيراد
                </>
              )}
            </Button>
          )}
          {importResult && importResult.failedCount > 0 && (
            <Button
              type='button'
              onClick={() => {
                setImportResult(null);
                setSelectedFile(null);
              }}
              className='w-full sm:w-auto'
            >
              إعادة المحاولة
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
