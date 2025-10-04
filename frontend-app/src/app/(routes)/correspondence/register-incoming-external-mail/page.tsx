import React, { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';
// services
import { externalEntitiesService } from '@/features/external-entities/api/external-entities.service';
import { organizationalService } from '@/features/organizational-unit/api/organizational.service';
import { IExternalEntityList } from '@/features/external-entities/types/external-entities';
import { IOrganizationalUnitList } from '@/features/organizational-unit/types/organizational';
import { RegisterIncomingExternalMailWizard } from '@/features/correspondence/register-incoming-external-mail';
import { hasAnyPermission } from '@/utils/auth/auth-utils';
import { currentUserService } from '@/utils/auth/corent-user.service';
import { UserDto } from '@/utils/auth/auth';
import Unauthorized from '@/components/auth/unauthorized';

export const metadata = {
  title: 'إضافة كتاب خارجي جديد',
  description: 'إضافة كتاب خارجي جديد'
};

// Force dynamic rendering since we use getServerSession which requires headers
export const dynamic = 'force-dynamic';

const RegisterIncomingExternalMail = async () => {
  const userData = await currentUserService.getCurrentUser();
  const hasPermission = hasAnyPermission(userData?.data as UserDto, [
    'Correspondence|Create|External',
    'Access|All'
  ]);
  if (!hasPermission) {
    return <Unauthorized />;
  }
  let externalEntitiesList: IExternalEntityList[] = [];
  let organizationalUnitsList: IOrganizationalUnitList[] = [];

  try {
    // Try to fetch external entities with fallback
    const externalEntities = await externalEntitiesService.getExternalEntities({
      page: 1,
      pageSize: 200
    });

    if (externalEntities?.succeeded && externalEntities?.data?.items) {
      externalEntitiesList = externalEntities.data
        .items as IExternalEntityList[];
    } else {
      console.warn(
        'External entities service returned empty or failed response, continuing with empty list'
      );
      externalEntitiesList = [];
    }
  } catch (error) {
    console.warn(
      'Failed to load external entities, continuing without them:',
      error
    );
    externalEntitiesList = [];
  }

  try {
    // Try to fetch organizational units with fallback
    const organizationalUnits =
      await organizationalService.getOrganizationalUnits({
        page: 1,
        pageSize: 200
      });

    if (organizationalUnits?.succeeded && organizationalUnits?.data?.items) {
      organizationalUnitsList = organizationalUnits.data
        .items as IOrganizationalUnitList[];
    } else {
      console.warn(
        'Organizational units service returned empty or failed response, continuing with empty list'
      );
      organizationalUnitsList = [];
    }
  } catch (error) {
    console.warn(
      'Failed to load organizational units, continuing without them:',
      error
    );
    organizationalUnitsList = [];
  }

  const initialData = null;

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <RegisterIncomingExternalMailWizard
            externalEntitiesList={externalEntitiesList}
            organizationalUnitsList={organizationalUnitsList}
            initialData={null}
            pageTitle={
              initialData
                ? 'تعديل الكتاب الوارد الخارجي'
                : 'تسجيل كتاب وارد خارجي جديد'
            }
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default RegisterIncomingExternalMail;
