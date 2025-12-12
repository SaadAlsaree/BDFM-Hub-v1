'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import {
  Mail,
  FileText,
  Clock,
  AlertCircle,
  Redo2,
  CalendarArrowDown,
  CalendarArrowUp,
  CalendarSync,
  Building
} from 'lucide-react';
import moment from 'moment';
import { CellAction } from './cell-action';
import Link from 'next/link';
import { InboxList } from '@/features/correspondence/types/register-incoming-external-mail';
import CellIcons from './cell-icons';

export const columns: ColumnDef<InboxList>[] = [
  {
    id: 'mailNum',
    accessorKey: 'mailNum',
    header: ({ column }: { column: Column<InboxList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الرقم الكتاب' />
    ),
    cell: ({ cell, row }) => {
      const internalNumber = cell.getValue<string>();
      return (
        <div className='flex flex-col'>
          <div className='flex cursor-pointer items-center gap-2'>
            <CellIcons data={row.original} />
            <Link
              href={`/president/not-completed/${row.original.correspondenceId}`}
              className='hover:text-primary/80 transition-colors duration-100'
            >
              {internalNumber || '-'}
            </Link>
          </div>
          <span className='text-primary mr-3 flex items-center gap-2 text-sm'>
            <Building className='h-4 w-4' />
            {row.original.createdByUnitName || '-'}
          </span>
        </div>
      );
    },
    meta: {
      label: 'الرقم الكتاب',
      placeholder: 'ابحث في الرقم الكتاب...',
      variant: 'text'
    },
    enableColumnFilter: true
  },
  {
    id: 'externalReferenceNumber',
    accessorKey: 'externalReferenceNumber',
    header: ({ column }: { column: Column<InboxList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الرقم الكتاب الخارجي' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>() || '-'}</div>,
    meta: {
      label: 'الرقم الكتاب الخارجي',
      placeholder: 'ابحث في الرقم الكتاب الخارجي...',
      variant: 'text'
    }
    // enableColumnFilter: true
  },
  {
    id: 'searchTerm',
    accessorKey: 'subject',
    header: ({ column }: { column: Column<InboxList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الموضوع' />
    ),
    cell: ({ cell }) => {
      const subject = cell.getValue<string>();
      return <div className='max-w-[300px] truncate'>{subject || '-'}</div>;
    },
    meta: {
      label: 'الموضوع',
      placeholder: 'بحث في الموضوع أو المحتوى ...',
      variant: 'text',
      icon: FileText
    },
    enableColumnFilter: true
  },
  {
    id: 'correspondenceType',
    accessorKey: 'correspondenceType',
    header: ({ column }: { column: Column<InboxList, unknown> }) => (
      <DataTableColumnHeader column={column} title='نوع الكتاب' />
    ),
    cell: ({ row }) => {
      const type = row.original.correspondenceType;
      const typeName = row.original.correspondenceTypeName;

      const getTypeIcon = (correspondenceType: number) => {
        switch (correspondenceType) {
          case 1: // IncomingExternal - وارد خارجي
            return <CalendarArrowDown className='h-4 w-4' />;
          case 2: // OutgoingExternal - صادر خارجي
            return <CalendarArrowUp className='h-4 w-4' />;
          case 3: // IncomingInternal - وارد داخلي
            return <CalendarSync className='h-4 w-4' />;
          case 4: // OutgoingInternal - صادر داخلي
            return <CalendarSync className='h-4 w-4' />;
          case 5: // Memorandum - المطالعة
            return <FileText className='h-4 w-4' />;
          case 6: // Reply - رد
            return <Redo2 className='h-4 w-4 scale-x-[-1]' />;
          default:
            return <Mail className='h-4 w-4' />;
        }
      };

      const getBadgeVariant = (correspondenceType: number) => {
        switch (correspondenceType) {
          case 0: // Draft
            return 'outline';
          case 1: // IncomingExternal
            return 'default';
          case 2: // OutgoingExternal
            return 'secondary';
          case 3: // IncomingInternal
            return 'outline';
          case 4: // OutgoingInternal
            return 'outline';
          case 5: // Memorandum
            return 'secondary';
          case 6: // Reply
            return 'default';
          default:
            return 'outline';
        }
      };

      return (
        <Badge
          variant={getBadgeVariant(type)}
          className='flex items-center gap-2'
        >
          {getTypeIcon(type)}
          {typeName || 'غير محدد'}
        </Badge>
      );
    },
    meta: {
      label: 'نوع الكتاب',
      variant: 'select',
      options: [
        { value: '0', label: 'مسودة' },
        { value: '1', label: 'وارد خارجي' },
        { value: '2', label: 'صادر خارجي' },
        { value: '3', label: 'وارد داخلي' },
        { value: '4', label: 'صادر داخلي' },
        { value: '5', label: 'المطالعة' },
        { value: '6', label: 'رد' }
      ],
      icon: Mail
    },
    enableColumnFilter: true
  },

  {
    id: 'priorityLevel',
    accessorKey: 'priorityLevelName',
    header: ({ column }: { column: Column<InboxList, unknown> }) => (
      <DataTableColumnHeader column={column} title='مستوى الأولوية' />
    ),
    cell: ({ cell, row }) => {
      const priority = cell.getValue<string>();
      const priorityLevel = row.original.priorityLevel;

      const getBadgeVariant = (level: number | undefined) => {
        switch (level) {
          case 4:
            return 'destructive'; // فوري
          case 3:
            return 'destructive'; // مستعجل جدا
          case 2:
            return 'default'; // مستعجل
          case 1:
            return 'secondary'; // عادي
          default:
            return 'outline'; // غير مرتبة
        }
      };

      return (
        <Badge variant={getBadgeVariant(priorityLevel)}>
          {priority || 'غير محدد'}
        </Badge>
      );
    },
    meta: {
      label: 'مستوى الأولوية',
      variant: 'select',
      options: [
        { value: '0', label: 'غير مرتبة' },
        { value: '1', label: 'عادي' },
        { value: '2', label: 'مستعجل' },
        { value: '3', label: 'مستعجل جدا' },
        { value: '4', label: 'فوري' }
      ],
      icon: AlertCircle
    },
    enableColumnFilter: true
  },
  {
    id: 'secrecyLevel',
    accessorKey: 'secrecyLevelName',
    header: ({ column }: { column: Column<InboxList, unknown> }) => (
      <DataTableColumnHeader column={column} title='مستوى السرية' />
    ),
    cell: ({ cell, row }) => {
      const secrecy = cell.getValue<string>();
      const secrecyLevel = row.original.secrecyLevel;

      const getBadgeVariant = (level: number | undefined) => {
        switch (level) {
          case 3:
            return 'destructive'; // سري للغاية
          case 2:
            return 'default'; // سري
          case 1:
            return 'secondary'; // محدود
          default:
            return 'outline'; // عام
        }
      };

      return (
        <Badge variant={getBadgeVariant(secrecyLevel)}>
          {secrecy || 'عام'}
        </Badge>
      );
    },
    meta: {
      label: 'مستوى السرية',
      variant: 'select',
      options: [
        { value: '0', label: 'عام' },
        { value: '1', label: 'محدود' },
        { value: '2', label: 'سري' },
        { value: '3', label: 'سري للغاية' }
      ]
    },
    enableColumnFilter: true
  },
  {
    id: 'status',
    accessorKey: 'statusName',
    header: ({ column }: { column: Column<InboxList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الحالة' />
    ),
    cell: ({ cell, row }) => {
      const status = cell.getValue<string>();
      const isRead = row.original.userCorrespondenceInteraction?.isRead;

      return (
        <div className='flex items-center gap-2'>
          <Badge variant={isRead ? 'outline' : 'default'}>
            {status || 'غير محدد'}
          </Badge>
          {!isRead && <div className='h-2 w-2 rounded-full bg-blue-500' />}
        </div>
      );
    },
    meta: {
      label: 'الحالة',
      variant: 'select'
    }
    // enableColumnFilter: true
  },
  {
    id: 'correspondenceStatus',
    accessorKey: 'correspondenceStatusName',
    header: ({ column }: { column: Column<InboxList, unknown> }) => (
      <DataTableColumnHeader column={column} title='الحالة الكتاب' />
    ),
    cell: ({ cell }) => {
      const statusName = cell.getValue<string>();

      const getBadgeVariant = (status: string | null) => {
        if (!status) return 'outline';

        // Map status names to badge variants based on CorrespondenceStatusEnum
        switch (status) {
          case 'مسجل': // Registered
            return 'blue';
          case 'قيد الانتظار': // PendingReferral
            return 'yellow';
          case 'قيد المعالجة': // UnderProcessing
            return 'blue';
          case 'قيد الموافقة': // PendingApproval
            return 'orange';
          case 'موافق': // Approved
            return 'green';
          case 'قيد التوقيع': // InSignatureAgenda
            return 'indigo';
          case 'موقع': // Signed
            return 'green';
          case 'إرسال أو صادر': // SentOrOutgoing
            return 'purple';
          case 'مكتمل': // Completed
            return 'green';
          case 'مرفوض': // Rejected
            return 'red';
          case 'إرجاع للتعديل': // ReturnedForModification
            return 'orange';
          case 'مؤجل': // Postponed
            return 'yellow';
          case 'ملغي': // Cancelled
            return 'red';
          default:
            return 'outline';
        }
      };

      return (
        <Badge variant={getBadgeVariant(statusName)}>
          {statusName || 'غير محدد'}
        </Badge>
      );
    },
    meta: {
      label: 'الحالة الكتاب',
      variant: 'select',
      options: [
        { value: '2', label: 'قيد الانتظار' },
        { value: '3', label: 'قيد المعالجة' },
        { value: '4', label: 'قيد الموافقة' },
        { value: '5', label: 'موافق' },
        { value: '6', label: 'قيد التوقيع' },
        { value: '7', label: 'موقع' },
        { value: '9', label: 'مكتمل' },
        { value: '11', label: 'إرجاع للتعديل' },
        { value: '12', label: 'مؤجل' },
        { value: '13', label: 'ملغي' }
      ]
    },
    enableColumnFilter: true
  },
  {
    id: 'receivedDate',
    accessorKey: 'receivedDate',
    header: ({ column }: { column: Column<InboxList, unknown> }) => (
      <DataTableColumnHeader column={column} title='تاريخ الانشاء' />
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
      label: 'تاريخ الانشاء',
      variant: 'date',
      placeholder: 'ابحث في تاريخ الانشاء...',
      icon: Clock
    },
    enableColumnFilter: true
  },
  {
    id: 'dueDate',
    accessorKey: 'dueDate',
    header: ({ column }: { column: Column<InboxList, unknown> }) => (
      <DataTableColumnHeader column={column} title='تاريخ الاستحقاق' />
    ),
    cell: ({ cell, row }) => {
      const date = cell.getValue<string>();
      const isOverdue = date && moment(date).isBefore(moment());
      const correspondenceStatusName = row.original.correspondenceStatusName;
      const shouldShowWarning =
        isOverdue &&
        (correspondenceStatusName === 'قيد المعالجة' ||
          correspondenceStatusName === 'قيد الانتظار');

      return date ? (
        <div className={shouldShowWarning ? 'font-medium text-red-600' : ''}>
          {moment(date).format('YYYY-MM-DD')}
          {shouldShowWarning && <span className='ml-1'>⚠️</span>}
        </div>
      ) : (
        <div>-</div>
      );
    },
    meta: {
      label: 'تاريخ الاستحقاق',
      variant: 'date',
      icon: Clock
    },
    enableColumnFilter: true
  },
  {
    id: 'fileNumber',
    accessorKey: 'fileNumber',
    header: ({ column }: { column: Column<InboxList, unknown> }) => (
      <DataTableColumnHeader column={column} title='رقم الاضبارة' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>() || '-'}</div>,
    meta: {
      label: 'رقم الاضبارة',
      placeholder: 'ابحث في رقم الملف...',
      variant: 'text'
    },
    enableColumnFilter: true
  },
  {
    id: 'actions',
    header: ({ column }: { column: Column<InboxList, unknown> }) => (
      <DataTableColumnHeader column={column} title='العمليات' />
    ),
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
