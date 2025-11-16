import React, { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';
import MailDraftForm from '@/features/correspondence/create-mail-draft/components/mail-draft-form';
import { hasAnyPermission } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';
import { correspondenceTemplatesService } from '@/features/correspondence-templates/api/correspondence-templates.service';
import { CorrespondenceTemplatesList } from '@/features/correspondence-templates/types/correspondence-templates';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';

export const metadata = {
  title: 'إضافة مسودة كتاب جديد',
  description: 'إضافة مسودة كتاب جديد'
};

// Force dynamic rendering since we use getServerSession which requires headers
export const dynamic = 'force-dynamic';

type pageProps = {
  searchParams: Promise<SearchParams>;
};

const CreateDraftMail = async ({ searchParams }: pageProps) => {
  await searchParamsCache.parse(await searchParams);

  const userData = await currentUserService.getCurrentUser();
  const hasPermission = hasAnyPermission(userData?.data as UserDto, [
    'Correspondence|Create|Draft',
    'Access|All'
  ]);
  if (!hasPermission) {
    return <Unauthorized />;
  }

  const searchText = searchParamsCache.get('searchText');

  const filters = {
    page: 1,
    pageSize: 10,
    ...(searchText && { searchText })
  };

  const data =
    await correspondenceTemplatesService.getCorrespondenceTemplates(filters);
  const correspondenceTemplates = (data?.data?.items ||
    []) as CorrespondenceTemplatesList[];

  // console.log(correspondenceTemplates);


  const user = userData?.data as UserDto;
  
  if (user.isDefaultPassword === true) {
    return (
      <PageContainer scrollable={false}>
        <DefaultPasswordWarning />
      </PageContainer>
    );
  }
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <MailDraftForm correspondenceTemplates={correspondenceTemplates} />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default CreateDraftMail;
