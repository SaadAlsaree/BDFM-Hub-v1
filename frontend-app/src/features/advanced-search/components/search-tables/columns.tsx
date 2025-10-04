'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import {
  Mail,
  Hash,
  Calendar,
  Building,
  FileText,
  User,
  Shield,
  Star,
  Eye
} from 'lucide-react';
import { InboxList } from '@/features/correspondence/types/register-incoming-external-mail';
import moment from 'moment';
import { CellAction } from './cell-actions';

export const columns: ColumnDef<InboxList>[] = [
  {
    id: 'mailNum',
    accessorKey: 'mailNum',
    header: ({ column }: { column: Column<InboxList, unknown> }) => (
      <DataTableColumnHeader column={column} title='رقم البريد' />
    ),
    cell: ({ cell }) => (
      <div className='font-medium'>{cell.getValue<string>()}</div>
    ),
    meta: {
      label: 'رقم البريد',
      placeholder: 'ابحث عن رقم البريد...',
      variant: 'text',
      icon: Hash
    },
    enableColumnFilter: true
  },
  {
    id: 'subject',
    accessorKey: 'subject',
    header: ({ column }: { column: Column<InboxList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الموضوع' />
    ),
    cell: ({ cell }) => {
      const subject = cell.getValue<string>();
      return (
        <div className='max-w-[300px] truncate' title={subject}>
          {subject}
        </div>
      );
    },
    meta: {
      label: 'الموضوع',
      placeholder: 'ابحث في الموضوع...',
      variant: 'text',
      icon: Mail
    },
    enableColumnFilter: true
  },
  {
    id: 'correspondenceTypeName',
    accessorKey: 'correspondenceTypeName',
    header: ({ column }: { column: Column<InboxList, unknown> }) => (
      <DataTableColumnHeader column={column} title='نوع المراسلة' />
    ),
    cell: ({ cell }) => {
      const typeName = cell.getValue<string>();
      return <div>{typeName || '-'}</div>;
    },
    meta: {
      label: 'نوع المراسلة',
      icon: Building
    }
  },
  {
    id: 'statusName',
    accessorKey: 'statusName',
    header: ({ column }: { column: Column<InboxList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الحالة' />
    ),
    cell: ({ cell }) => {
      const statusName = cell.getValue<string>();
      return statusName ? (
        <Badge variant='outline'>{statusName}</Badge>
      ) : (
        <div>-</div>
      );
    },
    meta: {
      label: 'الحالة',
      icon: User
    }
  },
  {
    id: 'externalReferenceNumber',
    accessorKey: 'externalReferenceNumber',
    header: ({ column }: { column: Column<InboxList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الرقم المرجعي الخارجي' />
    ),
    cell: ({ cell }) => {
      const refNumber = cell.getValue<string>();
      return <div>{refNumber || '-'}</div>;
    },
    meta: {
      label: 'الرقم المرجعي الخارجي',
      placeholder: 'ابحث عن الرقم المرجعي...',
      variant: 'text',
      icon: Hash
    },
    enableColumnFilter: true
  },
  {
    id: 'fileNumber',
    accessorKey: 'fileNumber',
    header: ({ column }: { column: Column<InboxList, unknown> }) => (
      <DataTableColumnHeader column={column} title='رقم الملف' />
    ),
    cell: ({ cell }) => {
      const fileNumber = cell.getValue<string>();
      return <div>{fileNumber || '-'}</div>;
    },
    meta: {
      label: 'رقم الملف',
      placeholder: 'ابحث عن رقم الملف...',
      variant: 'text',
      icon: FileText
    },
    enableColumnFilter: true
  },
  {
    id: 'secrecyLevelName',
    accessorKey: 'secrecyLevelName',
    header: ({ column }: { column: Column<InboxList, unknown> }) => (
      <DataTableColumnHeader column={column} title='مستوى السرية' />
    ),
    cell: ({ cell }) => {
      const secrecyLevel = cell.getValue<string>();
      return secrecyLevel ? (
        <Badge variant='outline' className='flex items-center gap-1'>
          <Shield className='h-3 w-3' />
          {secrecyLevel}
        </Badge>
      ) : (
        <div>-</div>
      );
    },
    meta: {
      label: 'مستوى السرية',
      icon: Shield
    }
  },
  {
    id: 'priorityLevelName',
    accessorKey: 'priorityLevelName',
    header: ({ column }: { column: Column<InboxList, unknown> }) => (
      <DataTableColumnHeader column={column} title='مستوى الأولوية' />
    ),
    cell: ({ cell }) => {
      const priorityLevel = cell.getValue<string>();
      return priorityLevel ? (
        <Badge variant='secondary' className='flex items-center gap-1'>
          <Star className='h-3 w-3' />
          {priorityLevel}
        </Badge>
      ) : (
        <div>-</div>
      );
    },
    meta: {
      label: 'مستوى الأولوية',
      icon: Star
    }
  },
  {
    id: 'mailDate',
    accessorKey: 'mailDate',
    header: ({ column }: { column: Column<InboxList, unknown> }) => (
      <DataTableColumnHeader column={column} title='تاريخ البريد' />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<string>();
      return date ? (
        <div className='flex items-center gap-1'>
          <Calendar className='h-3 w-3' />
          {moment(date).format('YYYY-MM-DD')}
        </div>
      ) : (
        <div>-</div>
      );
    }
  },
  {
    id: 'receivedDate',
    accessorKey: 'receivedDate',
    header: ({ column }: { column: Column<InboxList, unknown> }) => (
      <DataTableColumnHeader column={column} title='تاريخ الاستلام' />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<string>();
      return date ? (
        <div className='flex items-center gap-1'>
          <Calendar className='h-3 w-3' />
          {moment(date).format('YYYY-MM-DD')}
        </div>
      ) : (
        <div>-</div>
      );
    }
  },
  {
    id: 'externalReferenceDate',
    accessorKey: 'externalReferenceDate',
    header: ({ column }: { column: Column<InboxList, unknown> }) => (
      <DataTableColumnHeader column={column} title='تاريخ المرجع الخارجي' />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<string>();
      return date ? (
        <div className='flex items-center gap-1'>
          <Calendar className='h-3 w-3' />
          {moment(date).format('YYYY-MM-DD')}
        </div>
      ) : (
        <div>-</div>
      );
    }
  },
  {
    id: 'actions',
    header: ({ column }: { column: Column<InboxList, unknown> }) => (
      <DataTableColumnHeader column={column} title='العمليات' />
    ),
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
