'use client';

import { useState } from 'react';
import { useQueryState } from 'nuqs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { FilterIcon, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { useAuthApi } from '@/hooks/use-auth-api';
import { organizationalService } from '@/features/organizational-unit/api/organizational.service';
import { CorrespondenceTypeEnum, CorrespondenceTypeEnumDisplay } from '@/features/correspondence/types/register-incoming-external-mail';

export function CorrespondencesSummaryFilter() {
  const router = useRouter();
  const { authApiCall } = useAuthApi();
  const [isOpen, setIsOpen] = useState(false);

  const [unitId, setUnitId] = useQueryState('unitId');
  const [startDate, setStartDate] = useQueryState('startDate');
  const [endDate, setEndDate] = useQueryState('endDate');
  const [correspondenceType, setCorrespondenceType] = useQueryState(
    'correspondenceType',
    {
      parse: (value) => (value ? Number(value) : null),
      serialize: (value) => (value ? value.toString() : '')
    }
  );
  const [includeSubUnits, setIncludeSubUnits] = useQueryState(
    'includeSubUnits',
    {
      parse: (value) => value === 'true',
      serialize: (value) => (value ? 'true' : 'false')
    }
  );

  // Fetch units list
  const { data: unitsResponse } = useQuery({
    queryKey: ['organizationalUnits'],
    queryFn: async () =>
      await authApiCall(() =>
        organizationalService.getOrganizationalUnitListByIdClient(true)
      )
  });

  const units = unitsResponse?.data?.items || [];

  function onStartDateSelect(dateString: string) {
    if (dateString) {
      setStartDate(dateString);
    } else {
      setStartDate(null);
    }
  }

  function onEndDateSelect(dateString: string) {
    if (dateString) {
      setEndDate(dateString);
    } else {
      setEndDate(null);
    }
  }

  function onUnitSelect(selectedUnitId: string) {
    setUnitId(selectedUnitId === 'all' ? null : selectedUnitId);
  }

  function onCorrespondenceTypeSelect(value: string) {
    setCorrespondenceType(value === 'all' ? null : Number(value));
  }

  function onIncludeSubUnitsChange(value: string) {
    setIncludeSubUnits(value === 'true');
  }

  function onResetFilters() {
    setUnitId(null);
    setStartDate(null);
    setEndDate(null);
    setCorrespondenceType(null);
    setIncludeSubUnits(false);
  }

  function onApplyFilters() {
    setIsOpen(false);
    router.refresh();
  }

  const hasActiveFilters =
    unitId || startDate || endDate || correspondenceType !== null || includeSubUnits;

  const activeFiltersCount = [
    unitId,
    startDate,
    endDate,
    correspondenceType !== null,
    includeSubUnits
  ].filter(Boolean).length;

  const selectedUnit = units.find((unit) => unit.id === unitId);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant='outline' size='sm' className='flex items-center gap-2'>
          <FilterIcon className='h-4 w-4' />
          فلترة
          {activeFiltersCount > 0 && (
            <Badge
              variant='secondary'
              className='ml-1 h-5 w-5 rounded-full p-0 text-xs'
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='w-[400px] p-6 sm:w-[540px]'>
        <SheetHeader>
          <SheetTitle className='flex items-center gap-2'>
            <FilterIcon className='h-5 w-5' />
            فلترة التقرير
          </SheetTitle>
          <SheetDescription>
            اختر معايير الفلترة لعرض البيانات المطلوبة
          </SheetDescription>
        </SheetHeader>

        <div className='space-y-6 py-6'>
          {/* تاريخ البداية */}
          <div className='space-y-3'>
            <label className='text-sm font-medium'>تاريخ البداية</label>
            <Input
              value={startDate || ''}
              onChange={(e) => onStartDateSelect(e.target.value)}
              type='date'
            />
          </div>

          {/* تاريخ النهاية */}
          <div className='space-y-3'>
            <label className='text-sm font-medium'>تاريخ النهاية</label>
            <Input
              value={endDate || ''}
              onChange={(e) => onEndDateSelect(e.target.value)}
              type='date'
            />
          </div>

          {/* الوحدة التنظيمية */}
          <div className='space-y-3'>
            <label className='text-sm font-medium'>الجهة</label>
            <Select value={unitId || 'all'} onValueChange={onUnitSelect}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='اختر الجهة' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>جميع الجهات</SelectItem>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id || ''}>
                    {unit.unitName} {unit.unitCode && `(${unit.unitCode})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* نوع المراسلة */}
          <div className='space-y-3'>
            <label className='text-sm font-medium'>نوع المراسلة</label>
            <Select
              value={correspondenceType?.toString() || 'all'}
              onValueChange={onCorrespondenceTypeSelect}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='اختر النوع' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>جميع الأنواع</SelectItem>
                {Object.entries(CorrespondenceTypeEnumDisplay).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* تضمين الوحدات الفرعية */}
          <div className='space-y-3'>
            <label className='text-sm font-medium'>تضمين الوحدات الفرعية</label>
            <Select
              value={includeSubUnits?.toString() || 'false'}
              onValueChange={onIncludeSubUnitsChange}
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='true'>نعم</SelectItem>
                <SelectItem value='false'>لا</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ملخص الفلاتر */}
          {hasActiveFilters && (
            <div className='bg-muted/50 rounded-lg border p-4'>
              <h4 className='mb-3 text-sm font-medium'>الفلاتر المطبقة:</h4>
              <div className='flex flex-wrap gap-2'>
                {unitId && selectedUnit && (
                  <Badge variant='secondary' className='text-xs'>
                    الجهة: {selectedUnit.unitName}
                  </Badge>
                )}
                {startDate && (
                  <Badge variant='secondary' className='text-xs'>
                    من: {format(new Date(startDate + 'T00:00:00'), 'dd/MM/yyyy', { locale: ar })}
                  </Badge>
                )}
                {endDate && (
                  <Badge variant='secondary' className='text-xs'>
                    إلى: {format(new Date(endDate + 'T00:00:00'), 'dd/MM/yyyy', { locale: ar })}
                  </Badge>
                )}
                {correspondenceType !== null && (
                  <Badge variant='secondary' className='text-xs'>
                    النوع: {CorrespondenceTypeEnumDisplay[correspondenceType as CorrespondenceTypeEnum]}
                  </Badge>
                )}
                {includeSubUnits && (
                  <Badge variant='secondary' className='text-xs'>
                    تشمل الوحدات الفرعية
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <SheetFooter className='flex gap-2'>
          <Button
            variant='outline'
            onClick={onResetFilters}
            className='flex items-center gap-2'
          >
            <RotateCcw className='h-4 w-4' />
            إعادة تعيين
          </Button>
          <SheetClose asChild>
            <Button onClick={onApplyFilters} className='flex-1'>
              تطبيق الفلاتر
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
