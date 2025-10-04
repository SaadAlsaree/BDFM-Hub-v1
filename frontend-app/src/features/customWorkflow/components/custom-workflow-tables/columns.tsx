'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Workflow, Building, FileText, Calendar, Settings } from 'lucide-react';
import { CellAction } from './cell-action';
import {
  CustomWorkflowList,
  CorrespondenceTypeEnumNames
} from '@/features/customWorkflow/types/customWorkflow';
import moment from 'moment';

export const columns: ColumnDef<CustomWorkflowList>[] = [
  {
    id: 'workflowName',
    accessorKey: 'workflowName',
    header: ({ column }: { column: Column<CustomWorkflowList, unknown> }) => (
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
    header: ({ column }: { column: Column<CustomWorkflowList, unknown> }) => (
      <DataTableColumnHeader column={column} title='نوع المراسلة' />
    ),
    cell: ({ cell }) => {
      const type = cell.getValue<number>();
      const typeName =
        CorrespondenceTypeEnumNames[
          type as keyof typeof CorrespondenceTypeEnumNames
        ];
      return <div>{typeName || 'غير محدد'}</div>;
    },
    meta: {
      label: 'نوع المراسلة',
      variant: 'select',
      options: Object.entries(CorrespondenceTypeEnumNames).map(
        ([value, label]) => ({
          value: value,
          label: label
        })
      ),
      icon: FileText
    },
    enableColumnFilter: true
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: ({ column }: { column: Column<CustomWorkflowList, unknown> }) => (
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
    header: ({ column }: { column: Column<CustomWorkflowList, unknown> }) => (
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
    header: ({ column }: { column: Column<CustomWorkflowList, unknown> }) => (
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
    header: ({ column }: { column: Column<CustomWorkflowList, unknown> }) => (
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
    header: ({ column }: { column: Column<CustomWorkflowList, unknown> }) => (
      <DataTableColumnHeader column={column} title='العمليات' />
    ),
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
