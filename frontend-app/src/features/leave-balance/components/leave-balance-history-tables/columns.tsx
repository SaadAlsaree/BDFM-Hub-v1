'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { User, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import {
  LeaveBalanceHistory,
  LeaveType,
  LeaveTypeDisplay
} from '@/features/leave-balance/types/leave-balance';
import moment from 'moment';
import { formatDate } from '../../utils/leave-balance';

export const columns: ColumnDef<LeaveBalanceHistory>[] = [
  {
    id: 'employeeName',
    accessorKey: 'employeeName',
    header: ({ column }: { column: Column<LeaveBalanceHistory, unknown> }) => (
      <DataTableColumnHeader column={column} title='الموظف' />
    ),
    cell: ({ cell, row }) => {
      const employeeName = cell.getValue<string>();
      const employeeNumber = row.original.employeeNumber;
      return (
        <div className='flex flex-col'>
          <span>{employeeName || row.original.employeeId || '-'}</span>
          {employeeNumber && (
            <span className='text-xs text-gray-500'>{employeeNumber}</span>
          )}
        </div>
      );
    },
    meta: {
      label: 'الموظف',
      placeholder: 'ابحث عن اسم الموظف...',
      variant: 'text',
      icon: User
    },
    enableColumnFilter: true
  },
  {
    id: 'leaveType',
    accessorKey: 'leaveType',
    header: ({ column }: { column: Column<LeaveBalanceHistory, unknown> }) => (
      <DataTableColumnHeader column={column} title='نوع الإجازة' />
    ),
    cell: ({ cell }) => {
      const leaveType = cell.getValue<number>();
      return (
        <div>{leaveType ? LeaveTypeDisplay[leaveType as LeaveType] : '-'}</div>
      );
    },
    meta: {
      label: 'نوع الإجازة',
      variant: 'select',
      options: Object.keys(LeaveTypeDisplay).map((key) => ({
        value: key,
        label: LeaveTypeDisplay[parseInt(key) as LeaveType]
      }))
    },
    enableColumnFilter: true
  },
  {
    id: 'previousBalance',
    accessorKey: 'previousBalance',
    header: ({ column }: { column: Column<LeaveBalanceHistory, unknown> }) => (
      <DataTableColumnHeader column={column} title='الرصيد السابق' />
    ),
    cell: ({ cell }) => {
      const balance = cell.getValue<number>();
      return <div>{balance.toFixed(2)} يوم</div>;
    }
  },
  {
    id: 'changeAmount',
    accessorKey: 'changeAmount',
    header: ({ column }: { column: Column<LeaveBalanceHistory, unknown> }) => (
      <DataTableColumnHeader column={column} title='التغيير' />
    ),
    cell: ({ cell }) => {
      const change = cell.getValue<number>();
      const isPositive = change >= 0;
      return (
        <div className='flex items-center gap-1'>
          {isPositive ? (
            <TrendingUp className='h-4 w-4 text-green-600' />
          ) : (
            <TrendingDown className='h-4 w-4 text-red-600' />
          )}
          <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
            {isPositive ? '+' : ''}
            {change.toFixed(2)} يوم
          </span>
        </div>
      );
    }
  },
  {
    id: 'newBalance',
    accessorKey: 'newBalance',
    header: ({ column }: { column: Column<LeaveBalanceHistory, unknown> }) => (
      <DataTableColumnHeader column={column} title='الرصيد الجديد' />
    ),
    cell: ({ cell }) => {
      const balance = cell.getValue<number>();
      return <div className='font-semibold'>{balance.toFixed(2)} يوم</div>;
    }
  },
  {
    id: 'changeType',
    accessorKey: 'changeType',
    header: ({ column }: { column: Column<LeaveBalanceHistory, unknown> }) => (
      <DataTableColumnHeader column={column} title='نوع التغيير' />
    ),
    cell: ({ cell }) => {
      const changeType = cell.getValue<string>();
      const typeLabels: Record<string, string> = {
        Approval: 'موافقة',
        Cancellation: 'إلغاء',
        Interruption: 'قطع',
        MonthlyReset: 'إعادة تعيين شهري',
        HRSync: 'مزامنة HR'
      };
      return (
        <Badge variant='outline'>{typeLabels[changeType] || changeType}</Badge>
      );
    },
    meta: {
      label: 'نوع التغيير',
      variant: 'select',
      options: [
        { value: 'Approval', label: 'موافقة' },
        { value: 'Cancellation', label: 'إلغاء' },
        { value: 'Interruption', label: 'قطع' },
        { value: 'MonthlyReset', label: 'إعادة تعيين شهري' },
        { value: 'HRSync', label: 'مزامنة HR' }
      ]
    },
    enableColumnFilter: true
  },
  {
    id: 'changeReason',
    accessorKey: 'changeReason',
    header: ({ column }: { column: Column<LeaveBalanceHistory, unknown> }) => (
      <DataTableColumnHeader column={column} title='السبب' />
    ),
    cell: ({ cell }) => {
      const reason = cell.getValue<string>();
      return <div className='max-w-md truncate'>{reason || '-'}</div>;
    }
  },
  {
    id: 'changedByUserName',
    accessorKey: 'changedByUserName',
    header: ({ column }: { column: Column<LeaveBalanceHistory, unknown> }) => (
      <DataTableColumnHeader column={column} title='تم التغيير بواسطة' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>() || '-'}</div>
  },
  {
    id: 'changeDate',
    accessorKey: 'changeDate',
    header: ({ column }: { column: Column<LeaveBalanceHistory, unknown> }) => (
      <DataTableColumnHeader column={column} title='تاريخ التغيير' />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<string>();
      return date ? (
        <div>{moment(date).format('YYYY-MM-DD HH:mm')}</div>
      ) : (
        <div>-</div>
      );
    },
    meta: {
      label: 'تاريخ التغيير',
      icon: Calendar
    }
  }
];
