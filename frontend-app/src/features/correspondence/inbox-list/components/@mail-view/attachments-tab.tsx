'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AttachmentsExample from '@/features/attachments/components/attachments-example';
import { CorrespondenceDetails } from '../../types/correspondence-details';

interface AttachmentsTabProps {
  data: CorrespondenceDetails;
}

export function AttachmentsTab({ data }: AttachmentsTabProps) {
  return (
    <Card>
      <CardHeader></CardHeader>
      <CardContent>
        <AttachmentsExample primaryTableId={data.id} tableName={2} />
      </CardContent>
    </Card>
  );
}
