'use client';
import { Autocomplete } from '@/components/autocomplete';
// service
import { IMailFileList } from '@/features/mail-files/types/mail-files';
import { mailFilesService } from '@/features/mail-files/api/mail-files.service';
import { useAuthApi } from '@/hooks/use-auth-api';

type Props = {
  onSelectMailFile: (mailFile: IMailFileList | null) => void;
};

const MailFileSearch = ({ onSelectMailFile }: Props) => {
  const { authApiCall } = useAuthApi();
  const searchMailFiles = async (query: string): Promise<IMailFileList[]> => {
    if (!query) return [];

    const response = await authApiCall(() =>
      mailFilesService.searchMailFiles(query)
    );
    if (!response?.succeeded) {
      throw new Error('Failed to fetch mail files');
    }

    return (response.data as IMailFileList[]) || [];
  };

  // Call the parent callback when a mail file is selected
  const handleSelect = (mailFile: IMailFileList | null) => {
    onSelectMailFile(mailFile); // This passes the selected mail file to the parent
  };

  return (
    <div className='flex w-full flex-row items-center gap-4'>
      <Autocomplete
        className='w-full'
        onSearch={searchMailFiles}
        getItemValue={(mailFile) =>
          mailFile?.name || mailFile?.fileNumber || ''
        }
        renderItem={(mailFile, isHighlighted) => (
          <div className={isHighlighted ? 'font-bold' : ''}>
            <div>{mailFile.name || 'غير معروف'}</div>
            <div className='text-sm text-gray-500'>
              {mailFile.fileNumber} - {mailFile.subject}
            </div>
          </div>
        )}
        onSelect={handleSelect}
        placeholder='بحث عن أضبارة...'
      />
    </div>
  );
};

export default MailFileSearch;
