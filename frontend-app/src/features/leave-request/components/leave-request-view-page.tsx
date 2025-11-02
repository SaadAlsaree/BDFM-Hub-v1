'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { LeaveRequest, LeaveRequestStatus } from '../types/leave-request';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/animate-ui/radix/tabs';
import { useState } from 'react';
import { Workflow, FileText } from 'lucide-react';
import {
  LeaveRequestHeader,
  WorkflowTab,
  AttachmentsTab
} from './@leave-request-view';

interface LeaveRequestViewProps {
  data: LeaveRequest;
}

export default function LeaveRequestViewPage({ data }: LeaveRequestViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('workflow');

  return (
    <div className='flex flex-col gap-6 p-6'>
      {/* Header */}
      <LeaveRequestHeader data={data} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='workflow' className='flex items-center gap-2'>
            <Workflow className='h-4 w-4' />
            سير العمل
          </TabsTrigger>
          <TabsTrigger value='attachments' className='flex items-center gap-2'>
            <FileText className='h-4 w-4' />
            المرفقات
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <TabsContent value='workflow' className='space-y-6'>
          <WorkflowTab data={data} />
        </TabsContent>

        <TabsContent value='attachments'>
          <AttachmentsTab data={data} />
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className='flex justify-between border-t pt-6'>
        <Button
          variant='outline'
          onClick={() => router.push('/leave-request')}
        >
          العودة للقائمة
        </Button>

        <div className='flex gap-2'>
          {data.status === LeaveRequestStatus.Draft ||
          data.status === LeaveRequestStatus.PendingApproval ? (
            <Button
              onClick={() => router.push(`/leave-request/${data.id}/edit`)}
            >
              تعديل
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
