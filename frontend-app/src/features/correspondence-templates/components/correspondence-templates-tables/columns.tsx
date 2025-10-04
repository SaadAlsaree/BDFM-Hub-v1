'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';

import { CellAction } from './cell-action';
import { CorrespondenceTemplatesList } from '../../types/correspondence-templates';
import {
  formatDate,
  getCorrespondenceTemplateStatusText,
  CorrespondenceTemplateStatus,
  statusLabels
} from '../../utils/correspondence-templates';

export const columns: ColumnDef<CorrespondenceTemplatesList>[] = [
  {
    id: 'searchText',
    accessorKey: 'templateName',
    header: 'اسم القالب',
    cell: ({ row }) => (
      <div className='font-medium'>{row.getValue('searchText')}</div>
    ),
    meta: {
      label: 'اسم القالب',
      placeholder: 'اسم القالب',
      variant: 'text'
    },
    enableColumnFilter: true
  },
  {
    accessorKey: 'organizationalUnitName',
    header: 'جهة',
    cell: ({ row }) => <div>{row.getValue('organizationalUnitName')}</div>
  },
  {
    accessorKey: 'subject',
    header: 'الموضوع',
    cell: ({ row }) => <div className='truncate'>{row.getValue('subject')}</div>
  },
  {
    accessorKey: 'status',
    header: 'الحالة',
    cell: ({ row }) => {
      const status = row.getValue('status') as number;
      const statusName = getCorrespondenceTemplateStatusText(status);
      const variant =
        statusLabels[status as CorrespondenceTemplateStatus]?.variant ||
        'outline';

      return (
        <div className='flex items-center'>
          <Badge variant={variant}>{statusName}</Badge>
        </div>
      );
    }
  },
  {
    accessorKey: 'createAt',
    header: 'تاريخ الإنشاء',
    cell: ({ row }) => formatDate(row.getValue('createAt') as string)
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
