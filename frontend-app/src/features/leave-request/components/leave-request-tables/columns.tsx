'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Calendar, User, Building, FileText } from 'lucide-react';
import {
  LeaveRequestList,
  LeaveRequestStatus,
  LeaveType,
  LeaveTypeDisplay
} from '@/features/leave-request/types/leave-request';
import {
  statusLabels,
  getLeaveRequestStatusText
} from '@/features/leave-request/utils/leave-request';
import moment from 'moment';
import { CellAction } from './cell-action';

export const columns: ColumnDef<LeaveRequestList>[] = [
  {
    id: 'requestNumber',
    accessorKey: 'requestNumber',
    header: ({ column }: { column: Column<LeaveRequestList, unknown> }) => (
      <DataTableColumnHeader column={column} title='رقم الطلب' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>() || '-'}</div>,
    meta: {
      label: 'رقم الطلب',
      placeholder: 'ابحث عن رقم الطلب...',
      variant: 'text',
      icon: FileText
    },
    enableColumnFilter: true
  },
  {
    id: 'employeeName',
    accessorKey: 'employeeName',
    header: ({ column }: { column: Column<LeaveRequestList, unknown> }) => (
      <DataTableColumnHeader column={column} title='اسم الموظف' />
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
      label: 'اسم الموظف',
      placeholder: 'ابحث عن اسم الموظف...',
      variant: 'text',
      icon: User
    },
    enableColumnFilter: true
  },
  {
    id: 'organizationalUnitName',
    accessorKey: 'organizationalUnitName',
    header: ({ column }: { column: Column<LeaveRequestList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الوحدة التنظيمية' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>() || '-'}</div>,
    meta: {
      label: 'الوحدة التنظيمية',
      icon: Building
    }
  },
  {
    id: 'leaveType',
    accessorKey: 'leaveType',
    header: ({ column }: { column: Column<LeaveRequestList, unknown> }) => (
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
    id: 'startDate',
    accessorKey: 'startDate',
    header: ({ column }: { column: Column<LeaveRequestList, unknown> }) => (
      <DataTableColumnHeader column={column} title='تاريخ البداية' />
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
      label: 'تاريخ البداية',
      icon: Calendar
    }
  },
  {
    id: 'endDate',
    accessorKey: 'endDate',
    header: ({ column }: { column: Column<LeaveRequestList, unknown> }) => (
      <DataTableColumnHeader column={column} title='تاريخ النهاية' />
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
      label: 'تاريخ النهاية',
      icon: Calendar
    }
  },
  {
    id: 'requestedDays',
    accessorKey: 'requestedDays',
    header: ({ column }: { column: Column<LeaveRequestList, unknown> }) => (
      <DataTableColumnHeader column={column} title='عدد الأيام' />
    ),
    cell: ({ cell, row }) => {
      const requestedDays = cell.getValue<number>();
      const approvedDays = row.original.approvedDays;
      return (
        <div className='flex flex-col'>
          <span>{requestedDays || '-'}</span>
          {approvedDays && approvedDays !== requestedDays && (
            <span className='text-xs text-gray-500'>معتمد: {approvedDays}</span>
          )}
        </div>
      );
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<LeaveRequestList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الحالة' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<LeaveRequestStatus>();
      const statusInfo = statusLabels[status] || {
        label: 'غير معروف',
        variant: 'outline'
      };
      return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
    },
    meta: {
      label: 'الحالة',
      variant: 'select',
      options: Object.keys(statusLabels).map((key) => ({
        value: key,
        label: getLeaveRequestStatusText(parseInt(key))
      }))
    },
    enableColumnFilter: true
  },
  {
    id: 'approvedAt',
    accessorKey: 'approvedAt',
    header: ({ column }: { column: Column<LeaveRequestList, unknown> }) => (
      <DataTableColumnHeader column={column} title='تاريخ الموافقة' />
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
      label: 'تاريخ الموافقة',
      icon: Calendar
    }
  },
  {
    id: 'createAt',
    accessorKey: 'createAt',
    header: ({ column }: { column: Column<LeaveRequestList, unknown> }) => (
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
    header: ({ column }: { column: Column<LeaveRequestList, unknown> }) => (
      <DataTableColumnHeader column={column} title='العمليات' />
    ),
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
