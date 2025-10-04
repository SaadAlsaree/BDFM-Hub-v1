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
  WorkflowStepBulkInsertSchema,
  type WorkflowStepBulkInsertFormData
} from '../utils/workflow-step';
import { Check, ChevronsUpDown, Plus, Trash2 } from 'lucide-react';
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
  // onSubmit?: (data: WorkflowStepBulkInsertFormData) => void;
  defaultValues?: Partial<WorkflowStepBulkInsertFormData>;
}

export function WorkflowStepFormDialog({
  correspondenceId,
  trigger,
  // onSubmit,
  defaultValues
}: WorkflowStepFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [primaryRecipientTypes, setPrimaryRecipientTypes] = useState<number[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [userSearchValue, setUserSearchValue] = useState('');
  const [debouncedUserSearch, setDebouncedUserSearch] = useState('');
  const [unitSearchValue, setUnitSearchValue] = useState('');
  const [debouncedUnitSearch, setDebouncedUnitSearch] = useState('');
  const [userPopoverOpen, setUserPopoverOpen] = useState<number | null>(null);
  const [unitPopoverOpen, setUnitPopoverOpen] = useState<number | null>(null);

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

  const form = useForm<WorkflowStepBulkInsertFormData>({
    resolver: zodResolver(WorkflowStepBulkInsertSchema),
    defaultValues: {
      correspondenceId: correspondenceId,
      workflowSteps: [
        {
          actionType: 1,
          toPrimaryRecipientType: 1,
          toPrimaryRecipientId: '',
          instructionText: '',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          status: 1,
          isTimeSensitive: false
        }
      ],
      ...defaultValues
    }
  });

  // Initialize primary recipient types array
  const workflowSteps = form.watch('workflowSteps');

  // Initialize primary recipient types when component mounts
  React.useEffect(() => {
    if (workflowSteps && primaryRecipientTypes.length === 0) {
      setPrimaryRecipientTypes(workflowSteps.map(() => 1));
    }
  }, [workflowSteps, primaryRecipientTypes.length]);

  // Add new workflow step
  const addWorkflowStep = () => {
    const currentSteps = form.getValues('workflowSteps');
    const newStep = {
      actionType: 1,
      toPrimaryRecipientType: 1,
      toPrimaryRecipientId: '',
      instructionText: '',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      status: 1,
      isTimeSensitive: false
    };

    form.setValue('workflowSteps', [...currentSteps, newStep]);
    setPrimaryRecipientTypes([...primaryRecipientTypes, 1]);
  };

  // Remove workflow step
  const removeWorkflowStep = (index: number) => {
    const currentSteps = form.getValues('workflowSteps');
    if (currentSteps.length > 1) {
      const newSteps = currentSteps.filter((_, i) => i !== index);
      form.setValue('workflowSteps', newSteps);

      const newTypes = primaryRecipientTypes.filter((_, i) => i !== index);
      setPrimaryRecipientTypes(newTypes);
    }
  };

  // Update primary recipient type for specific step
  const updatePrimaryRecipientType = (index: number, value: number) => {
    const newTypes = [...primaryRecipientTypes];
    newTypes[index] = value;
    setPrimaryRecipientTypes(newTypes);
  };

  function onFormSubmit(data: WorkflowStepBulkInsertFormData) {
    setLoading(true);

    // Call the API directly
    authApiCall(() => workflowStepService.createBulkWorkflowSteps(data))
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
        // console.error('Error creating bulk workflow steps:', error);
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
          <Button variant='outline' className='w-full'>
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
            {/* Dynamic Workflow Steps */}
            {workflowSteps?.map((_, index) => (
              <div key={index} className='space-y-4 rounded-lg border p-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-medium'>
                    أجراء تحويل {index + 1}
                  </h3>
                  {workflowSteps.length > 1 && (
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => removeWorkflowStep(index)}
                      className='text-red-600 hover:text-red-700'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  )}
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name={`workflowSteps.${index}.actionType`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع الإجراء</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
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
                    name={`workflowSteps.${index}.toPrimaryRecipientType`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع المستلم الأساسي</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(Number(value));
                            updatePrimaryRecipientType(index, Number(value));
                          }}
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
                    {primaryRecipientTypes[index] === 1 ? (
                      <FormField
                        control={form.control}
                        name={`workflowSteps.${index}.toPrimaryRecipientId`}
                        render={({ field }) => (
                          <FormItem className='flex flex-col'>
                            <FormLabel>اسم الموظف</FormLabel>
                            <Popover
                              open={userPopoverOpen === index}
                              onOpenChange={(open) =>
                                setUserPopoverOpen(open ? index : null)
                              }
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
                                              `workflowSteps.${index}.toPrimaryRecipientId`,
                                              user.id
                                            );
                                            setUserPopoverOpen(null);
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
                                          {
                                            <div className='flex flex-col'>
                                              <h1 className='text-sm font-medium'>
                                                {user.fullName}
                                              </h1>
                                              <p className='text-muted-foreground text-xs'>
                                                {user.organizationalUnitName}
                                              </p>
                                            </div>
                                          }
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
                        name={`workflowSteps.${index}.toPrimaryRecipientId`}
                        render={({ field }) => (
                          <FormItem className='flex flex-col'>
                            <FormLabel>الجهة الأساسية</FormLabel>
                            <Popover
                              open={unitPopoverOpen === index}
                              onOpenChange={(open) =>
                                setUnitPopoverOpen(open ? index : null)
                              }
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
                                                `workflowSteps.${index}.toPrimaryRecipientId`,
                                                unit.id || ''
                                              );
                                              setUnitPopoverOpen(null);
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
                                            {
                                              <div className='flex flex-col'>
                                                <h1 className='text-sm font-medium'>
                                                  {unit?.unitName}
                                                </h1>
                                                <p className='text-muted-foreground text-xs'>
                                                  {unit?.parentUnitName}
                                                </p>
                                              </div>
                                            }
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
                    name={`workflowSteps.${index}.dueDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ الاستحقاق</FormLabel>
                        <FormControl>
                          <Input
                            type='datetime-local'
                            {...field}
                            value={
                              field.value
                                ? new Date(field.value)
                                    .toISOString()
                                    .slice(0, 16)
                                : new Date().toISOString().slice(0, 16)
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value) {
                                // Convert to ISO string format
                                const isoString = new Date(value).toISOString();
                                field.onChange(isoString);
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
                    name={`workflowSteps.${index}.status`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الحالة</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
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
                  name={`workflowSteps.${index}.instructionText`}
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
                  name={`workflowSteps.${index}.isTimeSensitive`}
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
            ))}

            {/* Add New Step Button */}
            <div className='flex justify-center'>
              <Button
                type='button'
                variant='outline'
                onClick={addWorkflowStep}
                className='w-full'
              >
                <Plus className='mr-2 h-4 w-4' />
                إضافة أجراء تحويل جديدة
              </Button>
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
