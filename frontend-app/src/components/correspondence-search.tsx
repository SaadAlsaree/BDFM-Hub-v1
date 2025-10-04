'use client';
import { Autocomplete } from '@/components/autocomplete';
// service
import { InboxList } from '@/features/correspondence/types/register-incoming-external-mail';
import { correspondenceService } from '@/features/correspondence/api/correspondence.service';
import { useAuthApi } from '@/hooks/use-auth-api';

type Props = {
  onSelectCorrespondence: (correspondence: InboxList | null) => void;
};

const CorrespondenceSearch = ({ onSelectCorrespondence }: Props) => {
  const { authApiCall } = useAuthApi();
  const searchCorrespondences = async (query: string): Promise<InboxList[]> => {
    if (!query) return [];

    const response = await authApiCall(() =>
      correspondenceService.searchCorrespondences(query)
    );
    if (!response?.succeeded) {
      throw new Error('Failed to fetch mail files');
    }

    // Map IMailFileList[] to InboxList[]
    return (response.data as InboxList[]) || [];
  };

  // Call the parent callback when a mail file is selected
  const handleSelect = (correspondence: InboxList | null) => {
    onSelectCorrespondence(correspondence); // This passes the selected mail file to the parent
  };

  return (
    <div className='flex w-full flex-row items-center gap-4'>
      <Autocomplete
        className='w-full'
        onSearch={searchCorrespondences}
        getItemValue={(correspondence) => correspondence?.subject || ''}
        renderItem={(correspondence, isHighlighted) => (
          <div className={isHighlighted ? 'font-bold' : ''}>
            <div>{correspondence.subject || 'غير معروف'}</div>
            <div className='text-sm text-gray-500'>
              {correspondence.mailNum} - {correspondence.subject}
            </div>
          </div>
        )}
        onSelect={handleSelect}
        placeholder='بحث عن كتاب...'
      />
    </div>
  );
};

export default CorrespondenceSearch;
