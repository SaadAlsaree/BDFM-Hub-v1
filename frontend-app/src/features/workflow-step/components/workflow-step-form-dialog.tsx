'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  ActionTypeDisplay,
  RecipientTypeDisplay,
  WorkflowStepStatusDisplay
} from '../types/workflow-step';
import { useAuthApi } from '@/hooks/use-auth-api';

import {
  WorkflowStepInputSchema,
  type WorkflowStepInputFormData
} from '../utils/workflow-step';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Spinner } from '@/components/spinner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { workflowStepService } from '../api/workflow-step.service';
import { toast } from 'sonner';
import { useSearchUser } from '@/hooks/use-search-user';
import { useSearchUnit } from '@/hooks/use-search-unit';
import { UserDetailed } from '@/features/users/types/user';
import { IOrganizationalUnitDetails } from '@/features/organizational-unit/types/organizational';

interface WorkflowStepFormDialogProps {
  correspondenceId: string;
  trigger?: React.ReactNode;
  defaultValues?: Partial<WorkflowStepInputFormData>;
}

export function WorkflowStepFormDialog({
  correspondenceId,
  trigger,
  defaultValues
}: WorkflowStepFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userSearchValue, setUserSearchValue] = useState('');
  const [debouncedUserSearch, setDebouncedUserSearch] = useState('');
  const [unitSearchValue, setUnitSearchValue] = useState('');
  const [debouncedUnitSearch, setDebouncedUnitSearch] = useState('');
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);
  const [unitPopoverOpen, setUnitPopoverOpen] = useState(false);

  const { authApiCall } = useAuthApi();
  const router = useRouter();

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

  const form = useForm<WorkflowStepInputFormData>({
    resolver: zodResolver(WorkflowStepInputSchema),
    defaultValues: {
      correspondenceId: correspondenceId,
      actionType: 1,
      toPrimaryRecipientType: 1,
      toPrimaryRecipientId: '',
      instructionText: '',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      status: 1,
      isTimeSensitive: false,
      ...defaultValues
    }
  });

  // Watch for recipient type changes
  const recipientType = form.watch('toPrimaryRecipientType');

  function onFormSubmit(data: WorkflowStepInputFormData) {
    setLoading(true);

    // Call the API directly
    authApiCall(() => workflowStepService.createWorkflowStep(data))
      .then((result) => {
        if (result?.data) {
          toast.success('تم إنشاء أجراء تحويل بنجاح');
          setOpen(false);
          form.reset();
          router.refresh();
        } else {
          toast.error('حدث خطأ أثناء إنشاء أجراء تحويل');
        }
      })
      .catch(() => {
        toast.error('حدث خطأ أثناء إنشاء أجراء تحويل');
      })
      .finally(() => {
        setLoading(false);
      });
  }

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant='outline' className='w-full'  size='sm'>
            <Plus className='h-4 w-4' />
            إنشاء أجراء تحويل جديدة
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] w-[600px] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>إنشاء أجراء تحويل جديدة</DialogTitle>
          <DialogDescription>
            املأ النموذج أدناه لإنشاء أجراء تحويل جديدة
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onFormSubmit)}
            className='space-y-6'
          >
            {/* Single Workflow Step Form */}
            <div className='space-y-4 rounded-lg border p-4'>
              <h3 className='text-lg font-medium'>أجراء تحويل</h3>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='actionType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع الإجراء</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl className='w-full'>
                          <SelectTrigger>
                            <SelectValue placeholder='اختر نوع الإجراء' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(ActionTypeDisplay).map(
                            ([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='toPrimaryRecipientType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع المستلم الأساسي</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl className='w-full'>
                          <SelectTrigger>
                            <SelectValue placeholder='اختر نوع المستلم' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(RecipientTypeDisplay).map(
                            ([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='col-span-2'>
                  {recipientType === 1 ? (
                    <FormField
                      control={form.control}
                      name='toPrimaryRecipientId'
                      render={({ field }) => (
                        <FormItem className='flex flex-col'>
                          <FormLabel>اسم الموظف</FormLabel>
                          <Popover
                            open={userPopoverOpen}
                            onOpenChange={setUserPopoverOpen}
                          >
                            <PopoverTrigger asChild>
                              <FormControl className='w-full'>
                                <Button
                                  variant='outline'
                                  role='combobox'
                                  className={cn(
                                    'w-full justify-between',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value
                                    ? users?.find(
                                        (user: UserDetailed) =>
                                          user.id === field.value
                                      )?.fullName
                                    : 'اختر موظف'}
                                  <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className='w-[300px] p-0'>
                              <Command>
                                <CommandInput
                                  placeholder='ابحث عن موظف...'
                                  value={userSearchValue}
                                  onValueChange={handleUserSearch}
                                />
                                <CommandList>
                                  <CommandEmpty>
                                    {isUserLoading
                                      ? 'جاري البحث...'
                                      : userError
                                        ? 'حدث خطأ في البحث'
                                        : 'لا يوجد موظفين'}
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {users?.map((user: any) => (
                                      <CommandItem
                                        value={user.fullName}
                                        key={user.id}
                                        onSelect={() => {
                                          form.setValue(
                                            'toPrimaryRecipientId',
                                            user.id
                                          );
                                          setUserPopoverOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            'mr-2 h-4 w-4',
                                            user.id === field.value
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormField
                      control={form.control}
                      name='toPrimaryRecipientId'
                      render={({ field }) => (
                        <FormItem className='flex flex-col'>
                          <FormLabel>الجهة الأساسية</FormLabel>
                          <Popover
                            open={unitPopoverOpen}
                            onOpenChange={setUnitPopoverOpen}
                          >
                            <PopoverTrigger asChild>
                              <FormControl className='w-full'>
                                <Button
                                  variant='outline'
                                  role='combobox'
                                  className={cn(
                                    'w-full justify-between',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value
                                    ? units?.find(
                                        (unit: IOrganizationalUnitDetails) =>
                                          unit.id === field.value
                                      )?.unitName
                                    : 'اختر الجهة الأساسية'}
                                  <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className='w-[300px] p-0'>
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
                                    {units?.map(
                                      (unit: IOrganizationalUnitDetails) => (
                                        <CommandItem
                                          value={unit.unitName}
                                          key={unit.id}
                                          onSelect={() => {
                                            form.setValue(
                                              'toPrimaryRecipientId',
                                              unit.id || ''
                                            );
                                            setUnitPopoverOpen(false);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              'mr-2 h-4 w-4',
                                              unit.id === field.value
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
                                      )
                                    )}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name='dueDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ الاستحقاق</FormLabel>
                      <FormControl>
                        <Input
                          type='datetime-local'
                          {...field}
                          value={
                            field.value
                              ? new Date(field.value).toISOString().slice(0, 16)
                              : new Date().toISOString().slice(0, 16)
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                              // Convert to Date object
                              const dateValue = new Date(value);
                              field.onChange(dateValue);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الحالة</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl className='w-full'>
                          <SelectTrigger>
                            <SelectValue placeholder='اختر الحالة' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(WorkflowStepStatusDisplay).map(
                            ([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='instructionText'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظة التحويل</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='أدخل نص الملاحظة هنا'
                        className='min-h-[100px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='isTimeSensitive'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>حساس للوقت</FormLabel>
                      <div className='text-muted-foreground text-sm'>
                        هل هذه الخطوة حساسة للوقت؟
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                إلغاء
              </Button>
              <Button disabled={loading} type='submit'>
                إنشاء أجراء تحويل
                {loading && (
                  <Spinner variant='default' className='ml-2 h-4 w-4' />
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
