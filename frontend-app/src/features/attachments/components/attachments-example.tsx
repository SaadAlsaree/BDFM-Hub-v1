import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthApi } from '@/hooks/use-auth-api';
import { attachmentService } from '@/features/attachments/api/attachment.service';
import { FileAttachmentQuery } from '../types/attachment';
import AttachmentsList from './attachments-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AttachmentForm from './attachment-form';

interface AttachmentsExampleProps {
  primaryTableId?: string;
  tableName?: number;
}

const AttachmentsExample = ({
  primaryTableId,
  tableName
}: AttachmentsExampleProps) => {
  const { authApiCall } = useAuthApi();

  // Query parameters for fetching attachments
  const queryParams: FileAttachmentQuery = {
    page: 1,
    pageSize: 50,
    primaryTableId,
    tableName,
    status: 1 // Active attachments only
  };

  // Fetch attachments data
  const {
    data: attachmentsResponse,
    isLoading,
    error
  } = useQuery({
    queryKey: ['attachments', queryParams],
    queryFn: async () =>
      await authApiCall(() =>
        attachmentService.getAttachmentByPrimaryTableIdClient(queryParams)
      ),
    enabled: !!primaryTableId // Only fetch if we have a primary table ID
  });

  const attachments = attachmentsResponse?.data?.items || [];

  const onDownloadAll = async () => {
    // Implement bulk download functionality
    console.log('Download all attachments for:', primaryTableId);
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>حدث خطأ في تحميل الملفات</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground'>
            حدث خطأ في تحميل الملفات. يرجى المحاولة مرة أخرى لاحقًا.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      <AttachmentsList
        attachments={attachments}
        isLoading={isLoading}
        onDownloadAll={attachments.length > 0 ? onDownloadAll : undefined}
        className='w-full'
      />

      <AttachmentForm
        primaryTableId={primaryTableId}
        tableName={tableName}
        onAttachmentsChange={() => {}}
        onSave={() => {}}
      />
    </div>
  );
};

export default AttachmentsExample;
