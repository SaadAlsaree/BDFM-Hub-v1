'use client';
import React from 'react';
import { CorrespondenceDetails } from '@/features/correspondence/inbox-list/types/correspondence-details';
import PublicTemplate from './public-template';
import { Heading } from '@/components/ui/heading';
import { Building, Printer, User } from 'lucide-react';
import moment from 'moment';
import { Separator } from '@/components/ui/separator';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Button } from '@/components/ui/button';

type PublicViewProps = {
  correspondenceItem: CorrespondenceDetails;
};
const PublicView = ({ correspondenceItem }: PublicViewProps) => {
  const { user, isLoading } = useCurrentUser();
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-start justify-between'>
        <div className='space-y-1'>
          <Heading
            title={correspondenceItem.subject || 'الكتاب'}
            description={`رقم الكتاب: ${correspondenceItem.mailNum || 'غير محدد'} | تاريخ الإنشاء: ${moment(correspondenceItem.createdAt).format('YYYY-MM-DD')}`}
          />
          <div className='flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300'>
            <Building className='h-4 w-4' />
            <span>{correspondenceItem.createdByUnitName || ''}</span>
            {correspondenceItem.createdByUserName && (
              <>
                <Separator orientation='vertical' className='h-4' />
                <User className='h-4 w-4' />
                <span className='space-y-4'>
                  منشئ بواسطة: {correspondenceItem.createdByUserName}
                </span>
                <span className=''>
                  {correspondenceItem.createdByUnitName || 'وحدة غير معروفة'} -
                  {correspondenceItem.createdByUnitCode ||
                    'رمز الوحدة غير معروف'}
                </span>
              </>
            )}
          </div>
        </div>

        <div className='flex gap-1'>
          <Button variant='outline' size='sm'>
            <Printer className='h-4 w-4' />
            طباعة
          </Button>
        </div>
      </div>
      <Separator orientation='horizontal' className='my-4' />
      <div className='flex flex-col items-center justify-center gap-4'>
        <PublicTemplate correspondenceItem={correspondenceItem} />
      </div>
    </div>
  );
};

export default PublicView;
