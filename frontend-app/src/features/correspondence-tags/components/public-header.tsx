import React from 'react';
import PublicFilter from './public-filter';
import { Separator } from '@/components/ui/separator';

const PublicHeader = () => {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>قائمة الأعمامات</h1>
          <p className='text-sm text-gray-500'>عرض جميع الأعمامات</p>
        </div>
        <div className='flex flex-row gap-2'>
          <PublicFilter />
        </div>
      </div>
      <Separator />
    </div>
  );
};
export default PublicHeader;
