'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { FileText, Hash, MessageSquare, Calendar } from 'lucide-react';
import { IMailFileList } from '@/features/mail-files/types/mail-files';
import {
  MailFileStatus,
  statusLabels
} from '@/features/mail-files/utils/mail-files';
import moment from 'moment';
import { CellAction } from './cell-action';

export const columns: ColumnDef<IMailFileList>[] = [
  {
    id: 'searchTerm',
    accessorKey: 'fileNumber',
    header: ({ column }: { column: Column<IMailFileList, unknown> }) => (
      <DataTableColumnHeader column={column} title='رقم الملف' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>()}</div>,
    meta: {
      label: 'رقم الملف',
      placeholder: 'ابحث عن رقم الملف...',
      variant: 'text',
      icon: Hash
    },
    enableColumnFilter: true
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<IMailFileList, unknown> }) => (
      <DataTableColumnHeader column={column} title='اسم الملف' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>()}</div>,
    meta: {
      label: 'اسم الملف',
      placeholder: 'ابحث عن اسم الملف...',
      variant: 'text',
      icon: FileText
    },
    enableColumnFilter: true
  },
  {
    id: 'subject',
    accessorKey: 'subject',
    header: ({ column }: { column: Column<IMailFileList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الموضوع' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>()}</div>,
    meta: {
      label: 'الموضوع',
      placeholder: 'ابحث عن الموضوع...',
      variant: 'text',
      icon: FileText
    },
    enableColumnFilter: true
  },
  {
    id: 'correspondenceCount',
    accessorKey: 'correspondenceCount',
    header: ({ column }: { column: Column<IMailFileList, unknown> }) => (
      <DataTableColumnHeader column={column} title='عدد الكتب' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<number>()}</div>,
    meta: {
      label: 'عدد الكتب',
      icon: MessageSquare
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<IMailFileList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الحالة' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<MailFileStatus>();
      const statusInfo = statusLabels[status] || {
        label: 'Unknown',
        variant: 'outline'
      };
      return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
    },
    meta: {
      label: 'الحالة',
      variant: 'select',
      options: [
        { value: MailFileStatus.Active.toString(), label: 'نشط' },
        { value: MailFileStatus.Inactive.toString(), label: 'غير نشط' },
        { value: MailFileStatus.Completed.toString(), label: 'مكتمل' },
        { value: MailFileStatus.Archived.toString(), label: 'مؤرشف' },
        { value: MailFileStatus.Deleted.toString(), label: 'محذوف' }
      ]
    },
    enableColumnFilter: true
  },
  {
    id: 'createAt',
    accessorKey: 'createAt',
    header: ({ column }: { column: Column<IMailFileList, unknown> }) => (
      <DataTableColumnHeader column={column} title='تاريخ الإنشاء' />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<string>();
      return date ? (
        <div>{moment(date).format('YYYY-MM-DD')}</div>
      ) : (
        <div>-</div>
      );
    },
    meta: {
      label: 'تاريخ الإنشاء',
      icon: Calendar
    }
  },
  {
    id: 'actions',
    header: ({ column }: { column: Column<IMailFileList, unknown> }) => (
      <DataTableColumnHeader column={column} title='العمليات' />
    ),
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
