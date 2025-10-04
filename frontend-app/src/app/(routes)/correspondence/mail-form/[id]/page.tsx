import React, { Suspense } from 'react';
import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import MailDraftForm from '@/features/correspondence/create-mail-draft/components/mail-draft-form';
import { correspondenceService } from '@/features/correspondence/api/correspondence.service';
import { hasAnyPermission } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';
import { SearchParams } from 'nuqs/server';
import { searchParamsCache } from '@/lib/searchparams';
import { correspondenceTemplatesService } from '@/features/correspondence-templates/api/correspondence-templates.service';
import { CorrespondenceTemplatesList } from '@/features/correspondence-templates/types/correspondence-templates';

export const metadata = {
  title: 'تعديل المسودة',
  description: 'تعديل المسودة'
};

// Force dynamic rendering since we use getServerSession which requires headers
export const dynamic = 'force-dynamic';

type pageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
};

const EditMailDraftPage = async (props: pageProps) => {
  const params = await props.params;
  const mailDraft = await correspondenceService.getCorrespondenceById(
    params.id
  );
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

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <MailDraftForm
            initialData={mailDraft?.data}
            correspondenceId={params.id}
            correspondenceTemplates={correspondenceTemplates}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default EditMailDraftPage;
