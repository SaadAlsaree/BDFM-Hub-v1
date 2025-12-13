'use client';

import * as React from 'react';
import { useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Send,
  Users as UsersIcon,
  Building2,
  AtSign,
  UserCheck,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { hasAnyPermission } from '@/utils/auth/auth-utils';
import {
  RecipientTypeEnum,
  type CorrespondenceTagItem,
  type CorrespondenceTagsRequest
} from '../types/tags';
import { CorrespondenceDetails } from '../../correspondence/inbox-list/types/correspondence-details';
import { useSearchUnit } from '@/hooks/use-search-unit';
import { IOrganizationalUnitDetails } from '@/features/organizational-unit/types/organizational';
import { useCurrentUser } from '@/hooks/use-current-user';
import { UserDto } from '@/utils/auth/auth';
import { useAuthApi } from '@/hooks/use-auth-api';
import { tagsService } from '../api/tags.service';
import { toast } from 'sonner';

type Props = {
  correspondenceItem: CorrespondenceDetails;
};

export function PublicDialogForm({ correspondenceItem }: Props) {
  const { user } = useCurrentUser();
  const { authApiCall } = useAuthApi();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // isAll state - when true, disables unit mentions
  const [isAll, setIsAll] = useState(false);

  // Unit search state
  const [unitSearchValue, setUnitSearchValue] = useState('');
  const [debouncedUnitSearch, setDebouncedUnitSearch] = useState('');
  const [unitPopoverOpen, setUnitPopoverOpen] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState<
    IOrganizationalUnitDetails[]
  >([]);

  const hasPermission = hasAnyPermission(user as UserDto, [
    'Correspondence|SendPublicCorrespondence'
  ]);

  // Debounce unit search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUnitSearch(unitSearchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [unitSearchValue]);

  // Unit Search using existing hook
  const {
    data: unitList,
    isLoading: isUnitLoading,
    error: unitError
  } = useSearchUnit({
    unit: debouncedUnitSearch
  });

  const units: IOrganizationalUnitDetails[] = unitList?.data || [];

  const handleUnitSearch = useCallback((searchText: string) => {
    setUnitSearchValue(searchText);
  }, []);

  // Build the correspondence tags data
  const buildCorrespondenceData = (): CorrespondenceTagItem[] => {
    const data: CorrespondenceTagItem[] = [];

    if (isAll) {
      data.push({
        name: undefined,
        category: 1,
        toPrimaryRecipientType: 1,
        toPrimaryRecipientId: undefined
      });
      return data;
    }

    // Add unit tags
    selectedUnits.forEach((unit) => {
      data.push({
        name: unit.unitName || undefined,
        category: 1,
        toPrimaryRecipientType: RecipientTypeEnum.Unit,
        toPrimaryRecipientId: unit.id || undefined
      });
    });

    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const request: CorrespondenceTagsRequest = {
      correspondenceId: correspondenceItem.id,
      isAll: isAll,
      data: buildCorrespondenceData()
    };

    console.log(request);
    const result = await authApiCall(() =>
      tagsService.createArrayTags(request)
    );
    if (result?.succeeded) {
      toast.success('تم إنشاء الأعمام بنجاح');
      setOpen(false);
      resetForm();
    } else {
      toast.error('حدث خطأ أثناء إنشاء الأعمام');
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setSubject('');
    setIsAll(false);
    setSelectedUnits([]);
    setUnitSearchValue('');
    setUnitPopoverOpen(false);
  };

  const handleIsAllChange = (checked: boolean) => {
    setIsAll(checked);
    if (checked) {
      // Clear all units when isAll is enabled
      setSelectedUnits([]);
      setUnitSearchValue('');
    }
  };

  const hasRecipients = isAll || selectedUnits.length > 0;

  const handleAddUnit = (unit: IOrganizationalUnitDetails) => {
    if (!selectedUnits.find((u) => u.id === unit.id)) {
      setSelectedUnits([...selectedUnits, unit]);
    }
    setUnitPopoverOpen(false);
    setUnitSearchValue('');
  };

  const handleRemoveUnit = (unitId: string) => {
    setSelectedUnits(selectedUnits.filter((u) => u.id !== unitId));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size='sm'
          className='gap-2 font-medium shadow-lg transition-shadow hover:shadow-xl'
        >
          <Send className='size-4' />
          أعمام الى
        </Button>
      </DialogTrigger>
      <DialogContent className='gap-0 overflow-hidden p-0 sm:max-w-[600px]'>
        <DialogHeader className='bg-muted/30 border-b px-6 pt-6 pb-4'>
          <div className='flex items-center gap-3'>
            <div className='w-full'>
              <DialogTitle className='text-left text-lg'>أعمام الى</DialogTitle>
              <DialogDescription className='text-left text-sm'></DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='flex flex-col'>
          <div className='space-y-5 px-6 py-5'>
            {/* isAll Checkbox */}
            {hasPermission && (
              <div className='bg-muted/30 flex items-center gap-3 rounded-lg border p-3'>
                <Checkbox
                  id='isAll'
                  checked={isAll}
                  onCheckedChange={handleIsAllChange}
                  className='size-5'
                />
                <div className='flex-1'>
                  <Label
                    htmlFor='isAll'
                    className='cursor-pointer text-sm font-medium'
                  >
                    إرسال للجميع
                  </Label>
                  <p className='text-muted-foreground mt-0.5 text-xs'>
                    عند التفعيل، سيتم إرسال المراسلة لجميع المستخدمين والجهات
                  </p>
                </div>
                <UserCheck
                  className={`size-5 ${isAll ? 'text-primary' : 'text-muted-foreground'}`}
                />
              </div>
            )}

            {/* Unit Selection */}
            <div className={isAll ? 'pointer-events-none opacity-50' : ''}>
              <div className='space-y-2'>
                <Label className='flex items-center gap-2 text-sm font-medium'>
                  <AtSign className='size-3.5 text-emerald-500' />
                  الجهات
                </Label>
                <Popover
                  open={unitPopoverOpen}
                  onOpenChange={setUnitPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      role='combobox'
                      className={cn(
                        'w-full justify-between',
                        !selectedUnits.length && 'text-muted-foreground'
                      )}
                      disabled={isAll}
                    >
                      {selectedUnits.length > 0
                        ? `${selectedUnits.length} جهة محددة`
                        : 'اختر جهات'}
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
                          {units?.map((unit: IOrganizationalUnitDetails) => (
                            <CommandItem
                              value={unit.unitName || ''}
                              key={unit.id}
                              onSelect={() => handleAddUnit(unit)}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  selectedUnits.find((u) => u.id === unit.id)
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              <div className='flex flex-col'>
                                <h1 className='text-sm font-medium'>
                                  {unit?.unitName}
                                </h1>
                                <p className='text-muted-foreground text-xs'>
                                  {unit?.parentUnitName}
                                </p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedUnits.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {selectedUnits.map((unit) => (
                      <div
                        key={unit.id}
                        className='flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700'
                      >
                        <Building2 className='size-3' />
                        {unit.unitName}
                        <button
                          type='button'
                          onClick={() => handleRemoveUnit(unit.id || '')}
                          className='ml-1 rounded-full hover:bg-emerald-200'
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recipients Preview */}
            {hasRecipients && (
              <div className='bg-muted/50 space-y-3 rounded-lg border p-4'>
                <div className='text-muted-foreground flex items-center gap-2 text-xs font-medium'>
                  <UsersIcon className='size-3.5' />
                  المستلمون
                </div>

                {isAll ? (
                  <div className='bg-primary/10 text-primary flex items-center gap-2 rounded-md px-3 py-2'>
                    <UserCheck className='size-4' />
                    <span className='text-sm font-medium'>
                      جميع المستخدمين والجهات
                    </span>
                  </div>
                ) : (
                  <div className='space-y-2'>
                    {/* Units */}
                    {selectedUnits.length > 0 && (
                      <div className='space-y-1.5'>
                        <div className='flex items-center gap-1.5 text-xs text-emerald-600'>
                          <AtSign className='size-3' />
                          الجهات ({selectedUnits.length})
                        </div>
                        <div className='flex flex-wrap gap-2'>
                          {selectedUnits.map((unit) => (
                            <div
                              key={unit.id}
                              className='flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700'
                            >
                              <Building2 className='size-3' />
                              {unit.unitName}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Subject Input */}
            <div className='space-y-2'>
              <Label htmlFor='name' className='text-sm font-medium'>
                ملاحظات
              </Label>
              <Input
                id='name'
                placeholder='أدخل ملاحظات الأعمام...'
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className='h-11'
              />
            </div>
          </div>

          <DialogFooter className='bg-muted/30 gap-2 border-t px-6 py-4 sm:gap-2'>
            <Button
              type='button'
              variant='ghost'
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='min-w-[100px] gap-2'
            >
              {isSubmitting ? (
                <div className='size-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
              ) : (
                <Send className='size-4' />
              )}
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
