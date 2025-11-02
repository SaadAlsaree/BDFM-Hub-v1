'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { FileText, Building, Calendar } from 'lucide-react';
import {
  LeaveWorkflowList,
  LeaveType,
  LeaveTypeDisplay
} from '@/features/leave-workflow/types/leave-workflow';
import moment from 'moment';
import { CellAction } from './cell-action';

export const columns: ColumnDef<LeaveWorkflowList>[] = [
  {
    id: 'workflowName',
    accessorKey: 'workflowName',
    header: ({
      column
    }: {
      column: Column<LeaveWorkflowList, unknown>;
    }) => <DataTableColumnHeader column={column} title='اسم مسار العمل' />,
    cell: ({ cell }) => <div>{cell.getValue<string>() || '-'}</div>,
    meta: {
      label: 'اسم مسار العمل',
      placeholder: 'ابحث عن اسم مسار العمل...',
      variant: 'text',
      icon: FileText
    },
    enableColumnFilter: true
  },
  {
    id: 'triggeringUnitName',
    accessorKey: 'triggeringUnitName',
    header: ({
      column
    }: {
      column: Column<LeaveWorkflowList, unknown>;
    }) => <DataTableColumnHeader column={column} title='الوحدة المحفزة' />,
    cell: ({ cell }) => <div>{cell.getValue<string>() || '-'}</div>,
    meta: {
      label: 'الوحدة المحفزة',
      icon: Building
    }
  },
  {
    id: 'triggeringLeaveType',
    accessorKey: 'triggeringLeaveType',
    header: ({
      column
    }: {
      column: Column<LeaveWorkflowList, unknown>;
    }) => <DataTableColumnHeader column={column} title='نوع الإجازة المحفز' />,
    cell: ({ cell }) => {
      const leaveType = cell.getValue<number>();
      return (
        <div>
          {leaveType
            ? LeaveTypeDisplay[leaveType as LeaveType]
            : 'الكل'}
        </div>
      );
    },
    meta: {
      label: 'نوع الإجازة المحفز'
    }
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: ({
      column
    }: {
      column: Column<LeaveWorkflowList, unknown>;
    }) => <DataTableColumnHeader column={column} title='الوصف' />,
    cell: ({ cell }) => {
      const description = cell.getValue<string>();
      return (
        <div className='max-w-md truncate'>{description || '-'}</div>
      );
    },
    meta: {
      label: 'الوصف'
    }
  },
  {
    id: 'isEnabled',
    accessorKey: 'isEnabled',
    header: ({
      column
    }: {
      column: Column<LeaveWorkflowList, unknown>;
    }) => <DataTableColumnHeader column={column} title='مفعل' />,
    cell: ({ cell }) => {
      const isEnabled = cell.getValue<boolean>();
      return (
        <Badge variant={isEnabled ? 'default' : 'outline'}>
          {isEnabled ? 'مفعل' : 'غير مفعل'}
        </Badge>
      );
    },
    meta: {
      label: 'مفعل',
      variant: 'select',
      options: [
        { value: 'true', label: 'مفعل' },
        { value: 'false', label: 'غير مفعل' }
      ]
    },
    enableColumnFilter: true
  },
  {
    id: 'createAt',
    accessorKey: 'createAt',
    header: ({
      column
    }: {
      column: Column<LeaveWorkflowList, unknown>;
    }) => <DataTableColumnHeader column={column} title='تاريخ الإنشاء' />,
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
    header: ({
      column
    }: {
      column: Column<LeaveWorkflowList, unknown>;
    }) => <DataTableColumnHeader column={column} title='العمليات' />,
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

