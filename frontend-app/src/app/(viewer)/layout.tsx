import type { Metadata } from 'next';
import { fontVariables } from '@/lib/font';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import QueryClientProvider from '@/providers/query-client-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'عرض المرفق',
  description: 'عرض المرفق'
};

export default function ViewerLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ar' dir='rtl' suppressHydrationWarning>
      <body className={cn('bg-white font-sans antialiased', fontVariables)}>
        <QueryClientProvider>
          {children}
          <Toaster />
        </QueryClientProvider>
      </body>
    </html>
  );
}
