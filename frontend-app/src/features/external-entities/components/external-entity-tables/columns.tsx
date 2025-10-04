'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Building, Hash, Tag, FileText } from 'lucide-react';
import { IExternalEntityList } from '@/features/external-entities/types/external-entities';
import {
  ExternalEntityStatus,
  statusLabels,
  ExternalEntityType,
  entityTypeLabels
} from '@/features/external-entities/utils/external-entities';
import moment from 'moment';
import { CellAction } from './cell-action';

export const columns: ColumnDef<IExternalEntityList>[] = [
  {
    id: 'entityName',
    accessorKey: 'entityName',
    header: ({ column }: { column: Column<IExternalEntityList, unknown> }) => (
      <DataTableColumnHeader column={column} title='اسم الجهة' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>()}</div>,
    meta: {
      label: 'اسم الجهة',
      placeholder: 'ابحث عن اسم الجهة...',
      variant: 'text',
      icon: Building
    },
    enableColumnFilter: true
  },
  {
    id: 'entityCode',
    accessorKey: 'entityCode',
    header: ({ column }: { column: Column<IExternalEntityList, unknown> }) => (
      <DataTableColumnHeader column={column} title='رمز الجهة' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>()}</div>,
    meta: {
      label: 'رمز الجهة',
      placeholder: 'ابحث عن رمز الجهة...',
      variant: 'text',
      icon: Hash
    }
  },
  {
    id: 'entityType',
    accessorKey: 'entityType',
    header: ({ column }: { column: Column<IExternalEntityList, unknown> }) => (
      <DataTableColumnHeader column={column} title='نوع الجهة' />
    ),
    cell: ({ cell }) => {
      const type = cell.getValue<ExternalEntityType>();
      return <div>{entityTypeLabels[type] || 'غير معروف'}</div>;
    },
    meta: {
      label: 'نوع الجهة',
      variant: 'select',
      options: [
        {
          value: ExternalEntityType.Ministry.toString(),
          label: 'وزارة'
        },
        { value: ExternalEntityType.Authority.toString(), label: 'هيئة' },
        { value: ExternalEntityType.Company.toString(), label: 'شركة' },
        { value: ExternalEntityType.Individual.toString(), label: 'مؤسسة' },
        { value: ExternalEntityType.Other.toString(), label: 'أخرى' }
      ],
      icon: Tag
    },
    enableColumnFilter: true
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<IExternalEntityList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الحالة' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<ExternalEntityStatus>();
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
        { value: ExternalEntityStatus.Active.toString(), label: 'Active' },
        {
          value: ExternalEntityStatus.Inactive.toString(),
          label: 'Inactive'
        },
        { value: ExternalEntityStatus.Deleted.toString(), label: 'Deleted' }
      ]
    },
    enableColumnFilter: true
  },
  {
    id: 'createAt',
    accessorKey: 'createAt',
    header: ({ column }: { column: Column<IExternalEntityList, unknown> }) => (
      <DataTableColumnHeader column={column} title='تاريخ الإنشاء' />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<string>();
      return date ? (
        <div>{moment(date).format('YYYY-MM-DD')}</div>
      ) : (
        <div>-</div>
      );
    }
  },
  {
    id: 'actions',
    header: ({ column }: { column: Column<IExternalEntityList, unknown> }) => (
      <DataTableColumnHeader column={column} title='العمليات' />
    ),
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
