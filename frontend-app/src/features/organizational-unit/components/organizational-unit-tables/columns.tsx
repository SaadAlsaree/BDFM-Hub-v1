'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Building, Hash, Mail, FileText } from 'lucide-react';
import {
  IOrganizationalUnitList,
  UnitType,
  UnitTypeDisplay
} from '@/features/organizational-unit/types/organizational';
import {
  OrganizationalUnitStatus,
  statusLabels
} from '@/features/organizational-unit/utils/organizational';
import moment from 'moment';
import { CellAction } from './cell-action';

export const columns: ColumnDef<IOrganizationalUnitList>[] = [
  {
    id: 'searchText',
    accessorKey: 'unitName',
    header: ({
      column
    }: {
      column: Column<IOrganizationalUnitList, unknown>;
    }) => <DataTableColumnHeader column={column} title='اسم الوحدة' />,
    cell: ({ cell, row }) => {
      const unitName = cell.getValue<string>();
      const unitType = row.original.unitType as UnitType;

      // تحديد اللون حسب نوع الوحدة
      const getUnitTypeColor = (type: UnitType) => {
        switch (type) {
          case UnitType.DEPARTMENT:
            return 'blue-outline';
          case UnitType.DIRECTORATE:
            return 'purple-outline';
          case UnitType.DIVISION:
            return 'green-outline';
          case UnitType.BRANCH:
            return 'orange-outline';
          case UnitType.OFFICE:
            return 'indigo-outline';
          default:
            return 'outline';
        }
      };

      return (
        <div className='flex items-center gap-2'>
          {unitType && (
            <Badge variant={getUnitTypeColor(unitType)} size='sm'>
              {UnitTypeDisplay[unitType]}
            </Badge>
          )}
          <span>{unitName}</span>
        </div>
      );
    },
    meta: {
      label: 'اسم الوحدة',
      placeholder: 'ابحث عن اسم الوحدة...',
      variant: 'text',
      icon: Building
    },
    enableColumnFilter: true
  },
  {
    id: 'unitCode',
    accessorKey: 'unitCode',
    header: ({
      column
    }: {
      column: Column<IOrganizationalUnitList, unknown>;
    }) => <DataTableColumnHeader column={column} title='رمز الوحدة' />,
    cell: ({ cell }) => <div>{cell.getValue<string>()}</div>,
    meta: {
      label: 'رمز الوحدة',
      placeholder: 'ابحث عن رمز الوحدة...',
      variant: 'text',
      icon: Hash
    }
  },
  {
    id: 'parentUnitName',
    accessorKey: 'parentUnitName',
    header: ({
      column
    }: {
      column: Column<IOrganizationalUnitList, unknown>;
    }) => <DataTableColumnHeader column={column} title='الوحدة الأم' />,
    cell: ({ cell }) => <div>{cell.getValue<string>() || 'وحدة رئيسية'}</div>,
    meta: {
      label: 'الوحدة الأم',
      icon: Building
    }
  },
  {
    id: 'unitDescription',
    accessorKey: 'unitDescription',
    header: ({
      column
    }: {
      column: Column<IOrganizationalUnitList, unknown>;
    }) => <DataTableColumnHeader column={column} title='الوصف' />,
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
    id: 'status',
    accessorKey: 'status',
    header: ({
      column
    }: {
      column: Column<IOrganizationalUnitList, unknown>;
    }) => <DataTableColumnHeader column={column} title='الحالة' />,
    cell: ({ cell }) => {
      const status = cell.getValue<OrganizationalUnitStatus>();
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
        { value: OrganizationalUnitStatus.Active.toString(), label: 'نشط' },
        {
          value: OrganizationalUnitStatus.Inactive.toString(),
          label: 'غير نشط'
        },
        { value: OrganizationalUnitStatus.Deleted.toString(), label: 'محذوف' }
      ]
    },
    enableColumnFilter: true
  },
  {
    id: 'canReceiveExternalMail',
    accessorKey: 'canReceiveExternalMail',
    header: ({
      column
    }: {
      column: Column<IOrganizationalUnitList, unknown>;
    }) => (
      <DataTableColumnHeader column={column} title='استقبال البريد الخارجي' />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue<boolean>();
      return <div>{value ? 'نعم' : 'لا'}</div>;
    },
    meta: {
      label: 'استقبال البريد الخارجي',
      icon: Mail
    }
  },
  {
    id: 'canSendExternalMail',
    accessorKey: 'canSendExternalMail',
    header: ({
      column
    }: {
      column: Column<IOrganizationalUnitList, unknown>;
    }) => (
      <DataTableColumnHeader column={column} title='إرسال البريد الخارجي' />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue<boolean>();
      return <div>{value ? 'نعم' : 'لا'}</div>;
    },
    meta: {
      label: 'إرسال البريد الخارجي',
      icon: Mail
    }
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: ({
      column
    }: {
      column: Column<IOrganizationalUnitList, unknown>;
    }) => <DataTableColumnHeader column={column} title='تاريخ الإنشاء' />,
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
    header: ({
      column
    }: {
      column: Column<IOrganizationalUnitList, unknown>;
    }) => <DataTableColumnHeader column={column} title='العمليات' />,
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
