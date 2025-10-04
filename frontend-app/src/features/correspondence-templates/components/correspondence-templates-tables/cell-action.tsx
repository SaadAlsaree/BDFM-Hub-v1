'use client';
import { useRouter } from 'next/navigation';
import { Edit, Eye, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { CorrespondenceTemplatesList } from '../../types/correspondence-templates';

interface CellActionProps {
  data: CorrespondenceTemplatesList;
}

export function CellAction({ data }: CellActionProps) {
  const router = useRouter();

  const onView = () => {
    router.push(`/correspondence-template/${data.id}`);
  };

  const onEdit = () => {
    router.push(`/correspondence-template/${data.id}/edit`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>الاجراءات</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={onView}>
            <Eye className='mr-2 h-4 w-4' />
            عرض
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit}>
            <Edit className='mr-2 h-4 w-4' />
            تعديل
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
