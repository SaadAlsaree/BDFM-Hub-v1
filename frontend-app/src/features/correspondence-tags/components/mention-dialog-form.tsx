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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Send,
  Users as UsersIcon,
  Building2,
  Hash,
  AtSign,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  RecipientTypeEnum,
  type CorrespondenceTagItem,
  type CorrespondenceTagsRequest
} from '../types/tags';
import { CorrespondenceDetails } from '../../correspondence/inbox-list/types/correspondence-details';
import { useSearchUser } from '@/hooks/use-search-user';
import { useSearchUnit } from '@/hooks/use-search-unit';
import { UserDetailed } from '@/features/users/types/user';
import { IOrganizationalUnitDetails } from '@/features/organizational-unit/types/organizational';
import { useAuthApi } from '@/hooks/use-auth-api';
import { tagsService } from '../api/tags.service';
import { toast } from 'sonner';

type Props = {
  correspondenceItem: CorrespondenceDetails;
};

export function MentionDialogForm({ correspondenceItem }: Props) {
  const { authApiCall } = useAuthApi();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User search state
  const [userSearchValue, setUserSearchValue] = useState('');
  const [debouncedUserSearch, setDebouncedUserSearch] = useState('');
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserDetailed[]>([]);

  // Unit search state
  const [unitSearchValue, setUnitSearchValue] = useState('');
  const [debouncedUnitSearch, setDebouncedUnitSearch] = useState('');
  const [unitPopoverOpen, setUnitPopoverOpen] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState<
    IOrganizationalUnitDetails[]
  >([]);

  // Debounce user search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUserSearch(userSearchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearchValue]);

  // Debounce unit search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUnitSearch(unitSearchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [unitSearchValue]);

  // User Search using existing hook
  const {
    data: userList,
    isLoading: isUserLoading,
    error: userError
  } = useSearchUser({
    user: debouncedUserSearch
  });

  const users: UserDetailed[] = userList?.data || [];

  // Unit Search using existing hook
  const {
    data: unitList,
    isLoading: isUnitLoading,
    error: unitError
  } = useSearchUnit({
    unit: debouncedUnitSearch
  });

  const units: IOrganizationalUnitDetails[] = unitList?.data || [];

  const handleUserSearch = useCallback((searchText: string) => {
    setUserSearchValue(searchText);
  }, []);

  const handleUnitSearch = useCallback((searchText: string) => {
    setUnitSearchValue(searchText);
  }, []);

  // Build the correspondence tags data
  const buildCorrespondenceData = (): CorrespondenceTagItem[] => {
    const data: CorrespondenceTagItem[] = [];

    // Add user tags
    selectedUsers.forEach((user) => {
      data.push({
        name: user.fullName || '',
        category: 2,
        toPrimaryRecipientType: RecipientTypeEnum.User,
        toPrimaryRecipientId: user.id
      });
    });

    // Add unit tags
    selectedUnits.forEach((unit) => {
      data.push({
        name: unit.unitName || '',
        category: 2,
        toPrimaryRecipientType: RecipientTypeEnum.Unit,
        toPrimaryRecipientId: unit.id || ''
      });
    });

    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const request: CorrespondenceTagsRequest = {
      correspondenceId: correspondenceItem.id,
      data: buildCorrespondenceData()
    };

    const result = await authApiCall(() =>
      tagsService.createArrayTags(request)
    );
    if (result?.succeeded) {
      toast.success('تم إنشاء الصوره منه الى بنجاح');
      setOpen(false);
      resetForm();
    } else {
      toast.error('حدث خطأ أثناء إنشاء الصوره منه الى');
    }

    setIsSubmitting(false);
  };

  const resetForm = () => {
    setSubject('');
    setSelectedUsers([]);
    setUserSearchValue('');
    setSelectedUnits([]);
    setUnitSearchValue('');
    setUserPopoverOpen(false);
    setUnitPopoverOpen(false);
  };

  const hasRecipients = selectedUsers.length > 0 || selectedUnits.length > 0;

  const handleAddUser = (user: UserDetailed) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setUserPopoverOpen(false);
    setUserSearchValue('');
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

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
          صوره منه الى
          <Send className='size-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='gap-0 overflow-hidden p-0 sm:max-w-[600px]'>
        <DialogHeader className='bg-muted/30 border-b px-6 pt-6 pb-4'>
          <div className='flex items-center gap-3'>
            {/* <div className='bg-primary/10 flex size-10 items-center justify-center rounded-full'>
              <Sparkles className='text-primary size-5' />
            </div> */}
            <div className='w-full'>
              <DialogTitle className='text-left text-lg'>
                صوره منه الى
              </DialogTitle>
              <DialogDescription className='text-left text-sm'></DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='flex flex-col'>
          <div className='space-y-5 px-6 py-5'>
            {/* User Selection */}
            <div className='space-y-2'>
              <Label className='flex items-center gap-2 text-sm font-medium'>
                <Hash className='size-3.5 text-blue-500' />
                المستخدمين
              </Label>
              <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    className={cn(
                      'w-full justify-between',
                      !selectedUsers.length && 'text-muted-foreground'
                    )}
                  >
                    {selectedUsers.length > 0
                      ? `${selectedUsers.length} مستخدم محدد`
                      : 'اختر مستخدمين'}
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-[400px] p-0'>
                  <Command>
                    <CommandInput
                      placeholder='ابحث عن مستخدم...'
                      value={userSearchValue}
                      onValueChange={handleUserSearch}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {isUserLoading
                          ? 'جاري البحث...'
                          : userError
                            ? 'حدث خطأ في البحث'
                            : 'لا يوجد مستخدمين'}
                      </CommandEmpty>
                      <CommandGroup>
                        {users?.map((user: UserDetailed) => (
                          <CommandItem
                            value={user.fullName}
                            key={user.id}
                            onSelect={() => handleAddUser(user)}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedUsers.find((u) => u.id === user.id)
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            <div className='flex flex-col'>
                              <h1 className='text-sm font-medium'>
                                {user.fullName}
                              </h1>
                              <p className='text-muted-foreground text-xs'>
                                {user.organizationalUnitName}
                              </p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedUsers.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {selectedUsers.map((user) => {
                    const getInitials = (name: string) => {
                      if (!name) return '??';
                      return name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase();
                    };

                    return (
                      <div
                        key={user.id}
                        className='flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700'
                      >
                        <Avatar className='size-4'>
                          <AvatarFallback className='bg-blue-100 text-[8px]'>
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        {user.fullName}
                        <button
                          type='button'
                          onClick={() => handleRemoveUser(user.id)}
                          className='ml-1 rounded-full hover:bg-blue-200'
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Unit Selection */}
            <div className='space-y-2'>
              <Label className='flex items-center gap-2 text-sm font-medium'>
                <AtSign className='size-3.5 text-emerald-500' />
                الجهات
              </Label>
              <Popover open={unitPopoverOpen} onOpenChange={setUnitPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    className={cn(
                      'w-full justify-between',
                      !selectedUnits.length && 'text-muted-foreground'
                    )}
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

            {/* Recipients Preview */}
            {hasRecipients && (
              <div className='bg-muted/50 space-y-3 rounded-lg border p-4'>
                <div className='text-muted-foreground flex items-center gap-2 text-xs font-medium'>
                  <UsersIcon className='size-3.5' />
                  المستلمون ({selectedUsers.length + selectedUnits.length})
                </div>
              </div>
            )}
            {/* Subject Input */}
            <div className='space-y-2'>
              <Label htmlFor='name' className='text-sm font-medium'>
                ملاحظات
              </Label>
              <Input
                id='name'
                placeholder='أدخل ملاحظات الكتاب...'
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
