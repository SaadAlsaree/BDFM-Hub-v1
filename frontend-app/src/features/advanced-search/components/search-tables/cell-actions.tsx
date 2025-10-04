'use client';

import { useState } from 'react';
import { Edit, Eye, MoreHorizontal, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { InboxList } from '@/features/correspondence/types/register-incoming-external-mail';

interface CellActionProps {
  data: InboxList;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onView = () => {
    router.push(`/correspondence/view/${data.correspondenceId}`);
  };

  const onEdit = () => {
    router.push(`/correspondence/edit/${data.correspondenceId}`);
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>العمليات</DropdownMenuLabel>
          <DropdownMenuItem onClick={onView}>
            <Eye className='mr-2 h-4 w-4' /> عرض
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit}>
            <Edit className='mr-2 h-4 w-4' /> تعديل
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
