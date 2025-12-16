'use client';
import React, { useEffect, useCallback } from 'react';
import { CorrespondenceDetails } from '@/features/correspondence/inbox-list/types/correspondence-details';
import { Heading } from '@/components/ui/heading';
import { Building, User } from 'lucide-react';
import moment from 'moment';
import { Separator } from '@/components/ui/separator';
// import { useCurrentUser } from '@/hooks/use-current-user';
// import { Button } from '@/components/ui/button';
import CorrespondenceTemplate from './components/correspondence-template';
import WorkflowView from './components/workflow-view';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { correspondenceService } from '@/features/correspondence/api/correspondence.service';
import { useAuthApi } from '@/hooks/use-auth-api';

interface Props {
  data: CorrespondenceDetails;
}
const CorrespondenceView = (props: Props) => {
  const { data } = props;
  const { authApiCall } = useAuthApi();

  const isRead = data?.userCorrespondenceInteraction?.isRead;

  // Mark correspondence as read when component mounts if it's unread
  const readMailByUserHandler = useCallback(async () => {
    if (isRead === false) {
      await authApiCall(() => correspondenceService.isRead(true, data.id!));
    }
  }, [isRead, data.id, authApiCall]);

  useEffect(() => {
    readMailByUserHandler();
  }, [readMailByUserHandler]);

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-between'>
        <div className='space-y-1'>
          <Heading
            title={data.subject || 'الكتاب'}
            description={`رقم الكdataتاب: ${data.mailNum || 'غير محدد'} | تاريخ الإنشاء: ${moment(data.createdAt).format('YYYY-MM-DD')}`}
          />
          <div className='flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300'>
            <Building className='h-4 w-4' />
            <span>{data.createdByUnitName || ''}</span>
            {data.createdByUserName && (
              <>
                <Separator orientation='vertical' className='h-4' />
                <User className='h-4 w-4' />
                <span className='space-y-4'>
                  منشئ بواسطة: {data.createdByUserName}
                </span>
                <span className=''>
                  {data.createdByUnitName || 'وحدة غير معروفة'} -
                  {data.createdByUnitCode || 'رمز الوحدة غير معروف'}
                </span>
              </>
            )}
          </div>
        </div>

        <div className='flex gap-1'>
          <Link href={`/correspondence/view/${data.id}`}>
            <Button variant='outline' size='sm'>
              تفاصيل كاملة
            </Button>
          </Link>
        </div>
      </div>
      <Separator orientation='horizontal' className='my-4' />
      <div className='flex justify-between gap-4'>
        <CorrespondenceTemplate correspondenceItem={data} />
        <WorkflowView workflowSteps={data.workflowSteps} />
      </div>
    </div>
  );
};

export default CorrespondenceView;
