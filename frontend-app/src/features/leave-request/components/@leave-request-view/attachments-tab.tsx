'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AttachmentsExample from '@/features/attachments/components/attachments-example';
import { LeaveRequest } from '../../types/leave-request';

interface AttachmentsTabProps {
  data: LeaveRequest;
}

export function AttachmentsTab({ data }: AttachmentsTabProps) {
  // Note: You may need to adjust the tableName value based on your backend configuration
  // For leave requests, this might be different from correspondence (which uses 2)
  const tableName = 3; // Adjust this value as needed for leave requests

  return (
    <Card>
      <CardHeader></CardHeader>
      <CardContent>
        <AttachmentsExample primaryTableId={data.id} tableName={tableName} />
      </CardContent>
    </Card>
  );
}

