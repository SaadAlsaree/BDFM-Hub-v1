'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { UserCircle, Calendar, Users, FileText } from 'lucide-react';
import { IDelegationList } from '@/features/delegations/types/delegation';
import {
  DelegationStatus,
  statusLabels
} from '@/features/delegations/utils/delegation';
import moment from 'moment';
import { CellAction } from './cell-action';

export const columns: ColumnDef<IDelegationList>[] = [
  {
    id: 'delegatorUserName',
    accessorKey: 'delegatorUserName',
    header: ({ column }: { column: Column<IDelegationList, unknown> }) => (
      <DataTableColumnHeader column={column} title='المفوض' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>()}</div>,
    meta: {
      label: 'المفوض',
      placeholder: 'ابحث عن المفوض...',
      variant: 'text',
      icon: UserCircle
    },
    enableColumnFilter: true
  },
  {
    id: 'delegateeUserName',
    accessorKey: 'delegateeUserName',
    header: ({ column }: { column: Column<IDelegationList, unknown> }) => (
      <DataTableColumnHeader column={column} title='المفوض إليه' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>()}</div>,
    meta: {
      label: 'المفوض إليه',
      placeholder: 'ابحث عن المفوض إليه...',
      variant: 'text',
      icon: UserCircle
    }
  },
  {
    id: 'roleName',
    accessorKey: 'roleName',
    header: ({ column }: { column: Column<IDelegationList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الدور' />
    ),
    cell: ({ cell }) => {
      const roleName = cell.getValue<string>();
      return <div>{roleName || '-'}</div>;
    },
    meta: {
      label: 'الدور',
      icon: Users
    }
  },
  {
    id: 'permissionName',
    accessorKey: 'permissionName',
    header: ({ column }: { column: Column<IDelegationList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الصلاحية' />
    ),
    cell: ({ cell }) => {
      const permissionName = cell.getValue<string>();
      return <div>{permissionName || '-'}</div>;
    },
    meta: {
      label: 'الصلاحية',
      icon: FileText
    }
  },
  {
    id: 'startDate',
    accessorKey: 'startDate',
    header: ({ column }: { column: Column<IDelegationList, unknown> }) => (
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
    header: ({ column }: { column: Column<IDelegationList, unknown> }) => (
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
    id: 'statusId',
    accessorKey: 'statusId',
    header: ({ column }: { column: Column<IDelegationList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الحالة' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<DelegationStatus>();
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
        { value: DelegationStatus.Active.toString(), label: 'نشط' },
        { value: DelegationStatus.Inactive.toString(), label: 'غير نشط' },
        { value: DelegationStatus.Deleted.toString(), label: 'محذوف' }
      ]
    },
    enableColumnFilter: true
  },
  {
    id: 'createdDate',
    accessorKey: 'createdDate',
    header: ({ column }: { column: Column<IDelegationList, unknown> }) => (
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
    header: ({ column }: { column: Column<IDelegationList, unknown> }) => (
      <DataTableColumnHeader column={column} title='العمليات' />
    ),
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
