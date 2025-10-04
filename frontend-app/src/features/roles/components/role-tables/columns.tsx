'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { UserCircle, Hash, Users, FileText } from 'lucide-react';
import { IRoleList } from '@/features/roles/types/role';
import { RoleStatus, statusLabels } from '@/features/roles/utils/role';
import moment from 'moment';
import { CellAction } from './cell-action';

export const columns: ColumnDef<IRoleList>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<IRoleList, unknown> }) => (
      <DataTableColumnHeader column={column} title='اسم الدور' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>()}</div>,
    meta: {
      label: 'اسم الدور',
      placeholder: 'ابحث عن اسم الدور...',
      variant: 'text',
      icon: UserCircle
    },
    enableColumnFilter: true
  },
  {
    id: 'value',
    accessorKey: 'value',
    header: ({ column }: { column: Column<IRoleList, unknown> }) => (
      <DataTableColumnHeader column={column} title='قيمة الدور' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>()}</div>,
    meta: {
      label: 'قيمة الدور',
      placeholder: 'ابحث عن قيمة الدور...',
      variant: 'text',
      icon: Hash
    }
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: ({ column }: { column: Column<IRoleList, unknown> }) => (
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
    id: 'statusId',
    accessorKey: 'statusId',
    header: ({ column }: { column: Column<IRoleList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الحالة' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<RoleStatus>();
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
        { value: RoleStatus.Active.toString(), label: 'Active' },
        { value: RoleStatus.Inactive.toString(), label: 'Inactive' },
        { value: RoleStatus.Deleted.toString(), label: 'Deleted' }
      ]
    },
    enableColumnFilter: true
  },
  {
    id: 'userCount',
    accessorKey: 'userCount',
    header: ({ column }: { column: Column<IRoleList, unknown> }) => (
      <DataTableColumnHeader column={column} title='عدد المستخدمين' />
    ),
    cell: ({ cell }) => {
      const count = cell.getValue<number>();
      return <div>{count}</div>;
    },
    meta: {
      label: 'عدد المستخدمين',
      icon: Users
    }
  },
  {
    id: 'createdDate',
    accessorKey: 'createdDate',
    header: ({ column }: { column: Column<IRoleList, unknown> }) => (
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
    header: ({ column }: { column: Column<IRoleList, unknown> }) => (
      <DataTableColumnHeader column={column} title='العمليات' />
    ),
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
