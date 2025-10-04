'use client';

import React, { ReactNode } from 'react';
import ErrorBoundary from '@/components/error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ErrorProviderProps {
  children: ReactNode;
}

/**
 * Global error provider component that wraps the entire application
 * with error boundaries to catch and handle errors gracefully
 */
const ErrorProvider = ({ children }: ErrorProviderProps) => {
  return (
    <ErrorBoundary
      fallback={
        <div className='space-y-4 p-4'>
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>حدث خطأ</AlertTitle>
            <AlertDescription>
              حدث خطأ غير متوقع في التطبيق. يُرجى تحديث الصفحة أو المحاولة
              لاحقًا.
            </AlertDescription>
          </Alert>
          <div className='mt-4'>
            <button
              className='bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2'
              onClick={() => window.location.reload()}
            >
              تحديث الصفحة
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default ErrorProvider;
