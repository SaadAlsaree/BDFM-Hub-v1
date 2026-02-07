'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { FileText, Calendar, Info } from 'lucide-react';
import { IAnnouncementList } from '../../types/announcements';
import {
  statusLabels
} from '../../utils/announcements';
import moment from 'moment';
import { CellAction } from './cell-action';

export const columns: ColumnDef<IAnnouncementList>[] = [
  {
    id: 'title',
    accessorKey: 'title',
    header: ({ column }: { column: Column<IAnnouncementList, unknown> }) => (
      <DataTableColumnHeader column={column} title='العنوان' />
    ),
    cell: ({ cell }) => <div className="font-medium">{cell.getValue<string>()}</div>,
    meta: {
      label: 'العنوان',
      placeholder: 'ابحث عن العنوان...',
      variant: 'text',
      icon: Info
    },
    enableColumnFilter: true
  },
  {
    id: 'unitName',
    accessorKey: 'unitName',
    header: ({ column }: { column: Column<IAnnouncementList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الوحدة' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>()}</div>,
    meta: {
      label: 'الوحدة',
      placeholder: 'ابحث عن الوحدة...',
      variant: 'text',
      icon: FileText
    },
    enableColumnFilter: true
  },
  {
    id: 'variant',
    accessorKey: 'variant',
    header: ({ column }: { column: Column<IAnnouncementList, unknown> }) => (
      <DataTableColumnHeader column={column} title='النوع' />
    ),
    cell: ({ cell }) => {
        const variant = cell.getValue<string>();
        return <Badge variant="outline">{variant}</Badge>
    },
    meta: {
      label: 'النوع',
      icon: Info
    }
  },
  {
    id: 'status',
    accessorKey: 'isActive',
    header: ({ column }: { column: Column<IAnnouncementList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الحالة' />
    ),
    cell: ({ cell }) => {
      const isActive = cell.getValue<boolean>();
      const statusInfo = isActive ? statusLabels[1] : statusLabels[0];
      return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
    },
    meta: {
      label: 'الحالة',
      variant: 'select',
      options: [
        { value: 'true', label: 'نشط' },
        { value: 'false', label: 'غير نشط' }
      ]
    },
    enableColumnFilter: true
  },
  {
    id: 'startDate',
    accessorKey: 'startDate',
    header: ({ column }: { column: Column<IAnnouncementList, unknown> }) => (
      <DataTableColumnHeader column={column} title='تاريخ البدء' />
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
      label: 'تاريخ البدء',
      icon: Calendar
    }
  },
  {
    id: 'endDate',
    accessorKey: 'endDate',
    header: ({ column }: { column: Column<IAnnouncementList, unknown> }) => (
      <DataTableColumnHeader column={column} title='تاريخ الانتهاء' />
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
      label: 'تاريخ الانتهاء',
      icon: Calendar
    }
  },
  {
    id: 'actions',
    header: ({ column }: { column: Column<IAnnouncementList, unknown> }) => (
      <DataTableColumnHeader column={column} title='العمليات' />
    ),
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
