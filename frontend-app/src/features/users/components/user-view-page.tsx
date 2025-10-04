import { notFound } from 'next/navigation';
import UserForm from './user-form';
import { UserDetailed, UserRole } from '@/features/users/types/user';
import { IPermissionList } from '@/features/permissions/types/permission';

type TUserViewPageProps = {
  user: UserDetailed;
  roles?: UserRole[];
  permissions?: IPermissionList[];
  organizationalUnits: Array<{ id: string; unitName: string }>;
};

export default async function UserView({
  user,
  roles,
  permissions,
  organizationalUnits
}: TUserViewPageProps) {
  let pageTitle = 'إنشاء مستخدم جديد';

  if (user?.id !== 'new') {
    if (!user) {
      notFound();
    }
    pageTitle = `تعديل المستخدم`;
  }

  return (
    <UserForm
      initialData={user}
      pageTitle={pageTitle}
      roles={roles as UserRole[]}
      organizationalUnits={organizationalUnits}
      permissions={permissions as IPermissionList[]}
    />
  );
}
