import React, { Suspense } from 'react';
import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { mailFilesService } from '@/features/mail-files/api/mail-files.service';
import MailFileForm from '@/features/mail-files/components/mail-file-form';
import { IMailFileDetail } from '@/features/mail-files/types/mail-files';

export const metadata = {
  title: 'تعديل الأضبارة',
  description: 'تعديل الأضبارة'
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
          <MailFileForm
            initialData={mailFile?.data as IMailFileDetail}
            pageTitle='تعديل الأضبارة'
          />
        </Suspense>
      </div>
    </PageContainer>
  )
}

export default page