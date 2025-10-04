import { searchParamsCache } from '@/lib/searchparams';
import UserTable from './user-tables';
import { columns } from './user-tables/columns';
import { userService } from '@/features/users/api/user.service';
import { IUserList } from '@/features/users/types/user';

type UserListingPage = {};

export default async function UserListingPage({}: UserListingPage) {
  // Showcasing the use of search params cache in nested RSCs
  const page = searchParamsCache.get('page');
  const searchTerm = searchParamsCache.get('searchTerm');
  const pageSize = searchParamsCache.get('pageSize');
  const status = searchParamsCache.get('status');
  const isActive = searchParamsCache.get('isActive');
  const organizationalUnitId = searchParamsCache.get('organizationalUnitId');

  const filters = {
    page,
    pageSize,
    ...(searchTerm && { searchTerm }),
    ...(status && { status: Number(status) }),
    ...(isActive && { isActive: isActive === true }),
    ...(organizationalUnitId && { organizationalUnitId })
  };

  const data = await userService.getUsers(filters);
  const totalUsers = data?.data?.totalCount || 0;
  const users = (data?.data?.items || []) as unknown as IUserList[];

  return (
    <UserTable<IUserList, unknown>
      data={users}
      totalItems={totalUsers}
      columns={columns}
    />
  );
}
