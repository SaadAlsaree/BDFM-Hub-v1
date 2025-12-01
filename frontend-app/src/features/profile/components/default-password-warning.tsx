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
        'border-primary/30 bg-card relative w-full overflow-hidden shadow-sm',
        className
      )}
    >
      {/* Content */}
      <div className='p-6'>
        <div className='flex items-start gap-4'>
          {/* Icon Container */}
          <div className='flex-shrink-0'>
            <div className='bg-primary/10 ring-primary/20 flex h-12 w-12 items-center justify-center rounded-full ring-2'>
              <AlertTriangle
                className='text-destructive h-6 w-6'
                fill='currentColor'
              />
            </div>
          </div>

          {/* Text Content */}
          <div className='flex-1 space-y-4'>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <h3 className='text-card-foreground text-lg font-semibold'>
                  تحذير أمني
                </h3>
                <Shield className='text-destructive h-4 w-4' />
              </div>
              <p className='text-muted-foreground text-sm leading-relaxed'>
                أنت تستخدم كلمة مرور افتراضية. يرجى تغيير كلمة المرور الخاصة بك
                <span className='text-card-foreground font-semibold'>
                  {' '}
                  فوراً{' '}
                </span>
                للحفاظ على أمان حسابك وحماية معلوماتك الشخصية.
              </p>
            </div>

            {/* Action Button */}
            {!onActionClick ? (
              <Link href='/profile/change-password'>
                <Button variant='destructive' size='sm' className='group'>
                  <span>تغيير كلمة المرور الآن</span>
                  <ArrowRight className='mr-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                </Button>
              </Link>
            ) : (
              <Button
                onClick={onActionClick}
                variant='destructive'
                size='sm'
                className='group'
              >
                <span>تغيير كلمة المرور الآن</span>
                <ArrowRight className='mr-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
