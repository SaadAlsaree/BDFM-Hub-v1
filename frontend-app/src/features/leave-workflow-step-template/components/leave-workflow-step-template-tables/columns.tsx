'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { FileText, Calendar, Settings } from 'lucide-react';
import { CellAction } from './cell-action';
import {
  LeaveWorkflowStepTemplate,
  ActionTypeEnum,
  ActionTypeDisplay,
  CustomWorkflowTargetTypeEnum,
  CustomWorkflowTargetTypeDisplay
} from '@/features/leave-workflow-step-template/types/leave-workflow-step-template';
import moment from 'moment';

export const columns: ColumnDef<LeaveWorkflowStepTemplate>[] = [
  {
    id: 'stepOrder',
    accessorKey: 'stepOrder',
    header: ({
      column
    }: {
      column: Column<LeaveWorkflowStepTemplate, unknown>;
    }) => <DataTableColumnHeader column={column} title='ترتيب الخطوة' />,
    cell: ({ cell }) => <div>{cell.getValue<number>()}</div>,
    meta: {
      label: 'ترتيب الخطوة',
      icon: FileText
    }
  },
  {
    id: 'actionType',
    accessorKey: 'actionType',
    header: ({
      column
    }: {
      column: Column<LeaveWorkflowStepTemplate, unknown>;
    }) => <DataTableColumnHeader column={column} title='نوع الإجراء' />,
    cell: ({ cell }) => {
      const actionType = cell.getValue<number>();
      return (
        <div>
          {actionType
            ? ActionTypeDisplay[actionType as ActionTypeEnum]
            : '-'}
        </div>
      );
    },
    meta: {
      label: 'نوع الإجراء',
      variant: 'select',
      options: Object.keys(ActionTypeDisplay).map((key) => ({
        value: key,
        label: ActionTypeDisplay[parseInt(key) as ActionTypeEnum]
      })),
      icon: FileText
    },
    enableColumnFilter: true
  },
  {
    id: 'targetType',
    accessorKey: 'targetType',
    header: ({
      column
    }: {
      column: Column<LeaveWorkflowStepTemplate, unknown>;
    }) => <DataTableColumnHeader column={column} title='نوع الهدف' />,
    cell: ({ cell }) => {
      const targetType = cell.getValue<number>();
      return (
        <div>
          {targetType
            ? CustomWorkflowTargetTypeDisplay[
                targetType as CustomWorkflowTargetTypeEnum
              ]
            : '-'}
        </div>
      );
    },
    meta: {
      label: 'نوع الهدف',
      variant: 'select',
      options: Object.keys(CustomWorkflowTargetTypeDisplay).map((key) => ({
        value: key,
        label:
          CustomWorkflowTargetTypeDisplay[
            parseInt(key) as CustomWorkflowTargetTypeEnum
          ]
      }))
    },
    enableColumnFilter: true
  },
  {
    id: 'targetIdentifier',
    accessorKey: 'targetIdentifier',
    header: ({
      column
    }: {
      column: Column<LeaveWorkflowStepTemplate, unknown>;
    }) => <DataTableColumnHeader column={column} title='معرف الهدف' />,
    cell: ({ cell }) => (
      <div className='max-w-[200px] truncate'>
        {cell.getValue<string>() || '-'}
      </div>
    ),
    meta: {
      label: 'معرف الهدف'
    }
  },
  {
    id: 'defaultInstructionText',
    accessorKey: 'defaultInstructionText',
    header: ({
      column
    }: {
      column: Column<LeaveWorkflowStepTemplate, unknown>;
    }) => <DataTableColumnHeader column={column} title='نص التعليمات' />,
    cell: ({ cell }) => {
      const text = cell.getValue<string>();
      return <div className='max-w-[200px] truncate'>{text || '-'}</div>;
    },
    meta: {
      label: 'نص التعليمات'
    }
  },
  {
    id: 'defaultDueDateOffsetDays',
    accessorKey: 'defaultDueDateOffsetDays',
    header: ({
      column
    }: {
      column: Column<LeaveWorkflowStepTemplate, unknown>;
    }) => <DataTableColumnHeader column={column} title='أيام التأخير' />,
    cell: ({ cell }) => {
      const days = cell.getValue<number>();
      return <div>{days || 0} يوم</div>;
    }
  },
  {
    id: 'isActive',
    accessorKey: 'isActive',
    header: ({
      column
    }: {
      column: Column<LeaveWorkflowStepTemplate, unknown>;
    }) => <DataTableColumnHeader column={column} title='الحالة' />,
    cell: ({ cell }) => {
      const isActive = cell.getValue<boolean>();
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'نشط' : 'غير نشط'}
        </Badge>
      );
    },
    meta: {
      label: 'الحالة',
      variant: 'select',
      options: [
        { value: 'true', label: 'نشط' },
        { value: 'false', label: 'غير نشط' }
      ],
      icon: Settings
    },
    enableColumnFilter: true
  },
  {
    id: 'createAt',
    accessorKey: 'createAt',
    header: ({
      column
    }: {
      column: Column<LeaveWorkflowStepTemplate, unknown>;
    }) => <DataTableColumnHeader column={column} title='تاريخ الإنشاء' />,
    cell: ({ cell }) => {
      const date = cell.getValue<string>();
      return date ? (
        <div>{moment(date).format('YYYY-MM-DD')}</div>
      ) : (
        <div>غير محدد</div>
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
      column: Column<LeaveWorkflowStepTemplate, unknown>;
    }) => <DataTableColumnHeader column={column} title='العمليات' />,
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

