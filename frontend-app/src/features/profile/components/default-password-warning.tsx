'use client';

import { AlertTriangle, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface DefaultPasswordWarningProps {
  onActionClick?: () => void;
  className?: string;
}

export function DefaultPasswordWarning({
  onActionClick,
  className
}: DefaultPasswordWarningProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden border-2 w-full h-72 border-orange-500/50 bg-gradient-to-br from-orange-50 via-orange-50/80 to-amber-50/50 dark:from-orange-950/30 dark:via-orange-950/20 dark:to-amber-950/20 shadow-lg transition-all duration-300 hover:shadow-xl',
        className
      )}
    >
      {/* Animated Background Pattern */}
      <div className='absolute inset-0 opacity-5 dark:opacity-10'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.3),transparent_50%)] animate-pulse' />
      </div>

      {/* Content */}
      <div className='relative p-6'>
        <div className='flex items-start gap-4'>
          {/* Icon Container */}
          <div className='flex-shrink-0'>
            <div className='relative'>
              <div className='absolute inset-0 rounded-full bg-orange-500/20 animate-ping' />
              <div className='relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg ring-4 ring-orange-500/20'>
                <AlertTriangle className='h-7 w-7 text-white' fill='currentColor' />
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className='flex-1 space-y-3'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <h3 className='text-lg font-bold text-orange-900 dark:text-orange-100'>
                  تحذير أمني
                </h3>
                <Shield className='h-4 w-4 text-orange-600 dark:text-orange-400' />
              </div>
              <p className='text-sm leading-relaxed text-orange-800 dark:text-orange-200'>
                أنت تستخدم كلمة مرور افتراضية. يرجى تغيير كلمة المرور الخاصة بك
                <span className='font-semibold'> فوراً </span>
                للحفاظ على أمان حسابك وحماية معلوماتك الشخصية.
              </p>
            </div>
          {!onActionClick && (
            <Link href='/profile/change-password'>
              <Button
                className='group mt-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md transition-all duration-200 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:scale-105'
                size='sm'
              >
                <span>تغيير كلمة المرور الآن</span>
                <ArrowRight className='mr-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
              </Button>
            </Link>
          )}
            {/* Action Button */}
            {onActionClick && (
              <Button
                onClick={onActionClick}
                className='group mt-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md transition-all duration-200 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:scale-105'
                size='sm'
              >
                <span>تغيير كلمة المرور الآن</span>
                <ArrowRight className='mr-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
              </Button>
            )}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className='absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-orange-500 via-amber-500 to-orange-500' />
        <div className='absolute bottom-0 right-0 h-20 w-20 rounded-full bg-orange-500/10 blur-2xl' />
      </div>
    </Card>
  );
}

