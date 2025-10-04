'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { UserCircle, Hash, FileText } from 'lucide-react';
import { IPermissionList } from '@/features/permissions/types/permission';
import { PermissionStatus, statusLabels } from '@/features/permissions/utils/permission';
import { CellAction } from './cell-action';

export const columns: ColumnDef<IPermissionList>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<IPermissionList, unknown> }) => (
      <DataTableColumnHeader column={column} title='اسم الصلاحية' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>()}</div>,
    meta: {
      label: 'اسم الصلاحية',
      placeholder: 'ابحث عن اسم الصلاحية...',
      variant: 'text',
      icon: UserCircle
    },
    enableColumnFilter: true
  },
  {
    id: 'value',
    accessorKey: 'value',
    header: ({ column }: { column: Column<IPermissionList, unknown> }) => (
      <DataTableColumnHeader column={column} title='قيمة الصلاحية' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>()}</div>,
    meta: {
      label: 'قيمة الصلاحية',
      placeholder: 'ابحث عن قيمة الصلاحية...',
      variant: 'text',
      icon: Hash
    },
    enableColumnFilter: true
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: ({ column }: { column: Column<IPermissionList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الوصف' />
    ),
    cell: ({ cell }) => {
      const description = cell.getValue<string>();
      return <div>{description || '-'}</div>;
    },
    meta: {
      label: 'الوصف',
      icon: FileText
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<IPermissionList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الحالة' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<PermissionStatus>();
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
        { value: PermissionStatus.Active.toString(), label: 'نشط' },
        { value: PermissionStatus.Inactive.toString(), label: 'غير نشط' },
        { value: PermissionStatus.Deleted.toString(), label: 'محذوف' }
      ]
    },
    enableColumnFilter: true
  },
  {
    id: 'actions',
    header: ({ column }: { column: Column<IPermissionList, unknown> }) => (
      <DataTableColumnHeader column={column} title='العمليات' />
    ),
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
