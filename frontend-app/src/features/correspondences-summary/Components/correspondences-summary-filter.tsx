'use client';

import { useState, useEffect } from 'react';
import { useQueryState } from 'nuqs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { FilterIcon, RotateCcw, Check, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { useSearchUnit } from '@/hooks/use-search-unit';
import { IOrganizationalUnitDetails } from '@/features/organizational-unit/types/organizational';
import {
  CorrespondenceTypeEnum,
  CorrespondenceTypeEnumDisplay
} from '@/features/correspondence/types/register-incoming-external-mail';

export function CorrespondencesSummaryFilter() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [unitPopoverOpen, setUnitPopoverOpen] = useState<boolean>(false);
  const [unitSearchValue, setUnitSearchValue] = useState('');
  const [debouncedUnitSearch, setDebouncedUnitSearch] = useState('');

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

  // Debounce unit search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUnitSearch(unitSearchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [unitSearchValue]);

  // Fetch units list using search hook
  const {
    data: unitList,
    isLoading: isUnitLoading,
    error: unitError
  } = useSearchUnit({
    unit: debouncedUnitSearch
  });

  const units: IOrganizationalUnitDetails[] = unitList?.data || [];

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

  function onUnitSelect(selectedUnitId: string | null) {
    setUnitId(selectedUnitId);
    setUnitPopoverOpen(false);
  }

  function handleUnitSearch(searchText: string) {
    setUnitSearchValue(searchText);
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
    unitId ||
    startDate ||
    endDate ||
    correspondenceType !== null ||
    includeSubUnits;

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
            <Popover
              open={unitPopoverOpen}
              onOpenChange={(open) => setUnitPopoverOpen(open)}
            >
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  role='combobox'
                  className={cn(
                    'w-full justify-between',
                    !unitId && 'text-muted-foreground'
                  )}
                >
                  {unitId
                    ? units?.find(
                        (unit: IOrganizationalUnitDetails) => unit.id === unitId
                      )?.unitName || 'اختر الجهة'
                    : 'جميع الجهات'}
                  <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-[400px] p-0'>
                <Command>
                  <CommandInput
                    placeholder='ابحث عن جهة...'
                    value={unitSearchValue}
                    onValueChange={handleUnitSearch}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {isUnitLoading
                        ? 'جاري البحث...'
                        : unitError
                          ? 'حدث خطأ في البحث'
                          : 'لا توجد جهات'}
                    </CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value='all'
                        onSelect={() => onUnitSelect(null)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            !unitId ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        جميع الجهات
                      </CommandItem>
                      {units?.map((unit: IOrganizationalUnitDetails) => (
                        <CommandItem
                          value={unit.unitName}
                          key={unit.id}
                          onSelect={() => onUnitSelect(unit.id || null)}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              unit.id === unitId ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          <div className='flex flex-col'>
                            <h1 className='text-sm font-medium'>
                              {unit?.unitName}
                              {unit?.unitCode && ` (${unit.unitCode})`}
                            </h1>
                            {unit?.parentUnitName && (
                              <p className='text-muted-foreground text-xs'>
                                {unit?.parentUnitName}
                              </p>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
                {Object.entries(CorrespondenceTypeEnumDisplay).map(
                  ([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  )
                )}
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
                    من:{' '}
                    {format(new Date(startDate + 'T00:00:00'), 'dd/MM/yyyy', {
                      locale: ar
                    })}
                  </Badge>
                )}
                {endDate && (
                  <Badge variant='secondary' className='text-xs'>
                    إلى:{' '}
                    {format(new Date(endDate + 'T00:00:00'), 'dd/MM/yyyy', {
                      locale: ar
                    })}
                  </Badge>
                )}
                {correspondenceType !== null && (
                  <Badge variant='secondary' className='text-xs'>
                    النوع:{' '}
                    {
                      CorrespondenceTypeEnumDisplay[
                        correspondenceType as CorrespondenceTypeEnum
                      ]
                    }
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
