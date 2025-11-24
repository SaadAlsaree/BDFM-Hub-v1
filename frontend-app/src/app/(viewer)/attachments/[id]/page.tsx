import { attachmentService } from '@/features/attachments/api/attachment.service';
import AttachmentViewPage from '@/features/attachments/components/attachment-view-page';
import { FileAttachmentDetail } from '@/features/attachments/types/attachment';
import React from 'react';

export const metadata = {
  title: 'عرض المرفق',
  description: 'عرض المرفق'
};

type pageProps = {
  params: Promise<{ id: string }>;
};

const page = async (props: pageProps) => {
  const params = await props.params;
  // Try to fetch initial data, but AttachmentViewPage will handle errors
  let initialData: FileAttachmentDetail | undefined;
  try {
    const attachment = await attachmentService.getAttachmentDetail(params.id);
    initialData = attachment?.data;
  } catch (error) {
    // If server-side fetch fails, client-side will handle it
    console.error('Failed to fetch attachment on server:', error);
  }

  return (
    <AttachmentViewPage attachmentId={params.id} initialData={initialData} />
  );
};

export default page;
