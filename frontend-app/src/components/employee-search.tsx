'use client';
import { Autocomplete } from '@/components/autocomplete';
//service
import { EmployeeProfile } from '@/features/users/types/user';
import { utilizesService } from '@/utils/utilies.service';

type Props = {
  onSelectUser: (user: EmployeeProfile | null) => void;
};

const EmployeeSearch = ({ onSelectUser }: Props) => {
  const searchUsers = async (query: string): Promise<EmployeeProfile[]> => {
    if (!query) return [];

    const response = await utilizesService.getTypeOfService({
      searchTerm: query
    });
    if (!response.succeeded) {
      throw new Error('Failed to fetch users');
    }

    return response.data;
  };

  // Call the parent callback when a user is selected
  const handleSelect = (user: EmployeeProfile | null) => {
    onSelectUser(user); // This passes the selected user to the parent
  };

  return (
    <div className='flex w-full flex-row items-center gap-4'>
      <Autocomplete
        // items={[]}
        className='w-full'
        onSearch={searchUsers}
        getItemValue={(user) => user?.fullName || ''}
        renderItem={(user, isHighlighted) => (
          <div className={isHighlighted ? 'font-bold' : ''}>
            <div>{user.fullName}</div>
            <div className='text-sm text-gray-500'>{user.jobCode}</div>
          </div>
        )}
        onSelect={handleSelect}
        placeholder='بحث عن موظف...'
      />
    </div>
  );
};

export default EmployeeSearch;
