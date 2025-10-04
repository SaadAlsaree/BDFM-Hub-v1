import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { mailFilesService } from '@/features/mail-files/api/mail-files.service';
import MailFileViewPage from '@/features/mail-files/components/mail-file-view-page';
import { IMailFileDetail } from '@/features/mail-files/types/mail-files';
import React, { Suspense } from 'react';


export const metadata = {
    title: 'بيانات الاضبارة',
    description: 'بيانات الاضبارة'
  };
  
  type pageProps = {
    params: Promise<{ id: string }>;
  }; 
const page = async (props: pageProps) => {
  const params = await props.params;
  const mailFile = await mailFilesService.getMailFileById(params.id);

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <MailFileViewPage data={mailFile?.data as IMailFileDetail}  />
        </Suspense>
      </div>
    </PageContainer>
  )
}

export default page