'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { User, Shield, Phone, Building } from 'lucide-react';
import { CellAction } from './cell-action';
import { IUserList } from '@/features/users/types/user';
import { AuthStatus, statusLabels } from '@/features/users/utils/user';
import moment from 'moment';

export const columns: ColumnDef<IUserList>[] = [
  {
    id: 'username',
    accessorKey: 'username',
    header: ({ column }: { column: Column<IUserList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الاسم الكامل' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>()}</div>,
    meta: {
      label: 'الاسم الكامل',
      placeholder: 'ابحث عن الاسم الكامل...',
      variant: 'text',
      icon: User
    },
    enableColumnFilter: true
  },
  {
    id: 'userLogin',
    accessorKey: 'userLogin',
    header: ({ column }: { column: Column<IUserList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الاسم المستخدم' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>()}</div>,
    meta: {
      label: 'الاسم المستخدم',
      placeholder: 'ابحث عن الاسم المستخدم...',
      variant: 'text',
      icon: Shield
    }
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: ({ column }: { column: Column<IUserList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الهاتف' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>()}</div>,
    meta: {
      label: 'الهاتف',
      icon: Phone
    }
  },
  {
    id: 'organizationalUnitName',
    accessorKey: 'organizationalUnitName',
    header: ({ column }: { column: Column<IUserList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الجهة' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>()}</div>,
    meta: {
      label: 'الجهة',
      icon: Building
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<IUserList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الحالة' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<AuthStatus>();
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
        { value: AuthStatus.Active.toString(), label: 'Active' },
        { value: AuthStatus.Inactive.toString(), label: 'Inactive' },
        { value: AuthStatus.Locked.toString(), label: 'Locked' },
        { value: AuthStatus.Deleted.toString(), label: 'Deleted' },
        { value: AuthStatus.Pending.toString(), label: 'Pending' },
        { value: AuthStatus.Rejected.toString(), label: 'Rejected' },
        { value: AuthStatus.Suspended.toString(), label: 'Suspended' },
        { value: AuthStatus.Banned.toString(), label: 'Banned' }
      ]
    },
    enableColumnFilter: true
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: ({ column }: { column: Column<IUserList, unknown> }) => (
      <DataTableColumnHeader column={column} title='البريد الإلكتروني' />
    ),
    cell: ({ cell }) => {
      const email = cell.getValue<string>();
      return <div>{email}</div>;
    }
  },

  {
    id: 'createAt',
    accessorKey: 'createAt',
    header: ({ column }: { column: Column<IUserList, unknown> }) => (
      <DataTableColumnHeader column={column} title='تاريخ الإنشاء' />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<string>();
      return date ? (
        <div>{moment(date).format('YYYY-MM-DD')}</div>
      ) : (
        <div>Unknown</div>
      );
    }
  },
  {
    id: 'actions',
    header: ({ column }: { column: Column<IUserList, unknown> }) => (
      <DataTableColumnHeader column={column} title='العمليات' />
    ),
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
