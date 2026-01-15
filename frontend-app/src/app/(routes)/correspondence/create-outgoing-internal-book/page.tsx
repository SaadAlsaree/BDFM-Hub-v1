import React, { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';
import { hasAnyPermission } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';
import CreateOutgoingInternalForm from '@/features/correspondence/create-outgoing-internal/create-outgoing-internal-form';
import { DefaultPasswordWarning } from '@/features/profile/components/default-password-warning';
import { correspondenceTemplatesService } from '@/features/correspondence-templates/api/correspondence-templates.service';
import { CorrespondenceTemplatesList } from '@/features/correspondence-templates/types/correspondence-templates';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'إضافة كتاب صادر داخلي',
  description: 'إضافة كتاب صادر داخلي'
};

// Force dynamic rendering since we use getServerSession which requires headers
export const dynamic = 'force-dynamic';

type pageProps = {
  searchParams: Promise<SearchParams>;
};

const CreateOutgoingInternalBook = async ({ searchParams }: pageProps) => {
  await searchParamsCache.parse(await searchParams);

  const userData = await currentUserService.getCurrentUser();
  const hasPermission = hasAnyPermission(userData?.data as UserDto, [
    'Correspondence|Create',
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

  const templatesData =
    await correspondenceTemplatesService.getCorrespondenceTemplates(filters);
  const correspondenceTemplates = (templatesData?.data?.items ||
    []) as CorrespondenceTemplatesList[];

  const data = await currentUserService.getCurrentUser();
  const user = data?.data as UserDto;
  
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
          <CreateOutgoingInternalForm correspondenceTemplates={correspondenceTemplates} />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default CreateOutgoingInternalBook;
