'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import UserImportCsvDialog from './user-import-csv-dialog';

export default function UserImportCsvButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant='outline'
        onClick={() => setIsOpen(true)}
        className='text-xs md:text-sm'
      >
        <Upload className='mr-2 h-4 w-4' />
        استيراد من CSV
      </Button>
      <UserImportCsvDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
