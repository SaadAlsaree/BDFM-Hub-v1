'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Workflow, Building, FileText, Calendar, Settings } from 'lucide-react';
import { CellAction } from './cell-action';
import {
  CustomWorkflowItem,
  CorrespondenceTypeDisplayName
} from '@/features/custom-workflow/types/custom-workflow';
import moment from 'moment';

export const columns: ColumnDef<CustomWorkflowItem>[] = [
  {
    id: 'workflowName',
    accessorKey: 'workflowName',
    header: ({ column }: { column: Column<CustomWorkflowItem, unknown> }) => (
      <DataTableColumnHeader column={column} title='اسم سير العمل' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>()}</div>,
    meta: {
      label: 'اسم سير العمل',
      placeholder: 'ابحث عن اسم سير العمل...',
      variant: 'text',
      icon: Workflow
    },
    enableColumnFilter: true
  },
  {
    id: 'triggeringCorrespondenceType',
    accessorKey: 'triggeringCorrespondenceType',
    header: ({ column }: { column: Column<CustomWorkflowItem, unknown> }) => (
      <DataTableColumnHeader column={column} title='نوع الكتاب' />
    ),
    cell: ({ cell }) => {
      const type = cell.getValue<number>();
      const typeName =
        CorrespondenceTypeDisplayName[
          type as keyof typeof CorrespondenceTypeDisplayName
        ];
      return <div>{typeName || 'غير محدد'}</div>;
    },
    meta: {
      label: 'نوع الكتاب',
      variant: 'select',
      options: Object.entries(CorrespondenceTypeDisplayName).map(
        ([value, label]) => ({ value, label })
      ),
      icon: FileText
    },
    enableColumnFilter: true
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: ({ column }: { column: Column<CustomWorkflowItem, unknown> }) => (
      <DataTableColumnHeader column={column} title='الوصف' />
    ),
    cell: ({ cell }) => {
      const description = cell.getValue<string>();
      return <div className='max-w-[200px] truncate'>{description}</div>;
    },
    meta: {
      label: 'الوصف',
      icon: FileText
    }
  },
  {
    id: 'isEnabled',
    accessorKey: 'isEnabled',
    header: ({ column }: { column: Column<CustomWorkflowItem, unknown> }) => (
      <DataTableColumnHeader column={column} title='الحالة' />
    ),
    cell: ({ cell }) => {
      const isEnabled = cell.getValue<boolean>();
      return (
        <Badge variant={isEnabled ? 'default' : 'secondary'}>
          {isEnabled ? 'مفعل' : 'غير مفعل'}
        </Badge>
      );
    },
    meta: {
      label: 'الحالة',
      variant: 'select',
      options: [
        { value: 'true', label: 'مفعل' },
        { value: 'false', label: 'غير مفعل' }
      ],
      icon: Settings
    },
    enableColumnFilter: true
  },
  {
    id: 'createAt',
    accessorKey: 'createAt',
    header: ({ column }: { column: Column<CustomWorkflowItem, unknown> }) => (
      <DataTableColumnHeader column={column} title='تاريخ الإنشاء' />
    ),
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
    id: 'createBy',
    accessorKey: 'createBy',
    header: ({ column }: { column: Column<CustomWorkflowItem, unknown> }) => (
      <DataTableColumnHeader column={column} title='أنشئ بواسطة' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>()}</div>,
    meta: {
      label: 'أنشئ بواسطة',
      icon: Building
    }
  },
  {
    id: 'actions',
    header: ({ column }: { column: Column<CustomWorkflowItem, unknown> }) => (
      <DataTableColumnHeader column={column} title='العمليات' />
    ),
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
