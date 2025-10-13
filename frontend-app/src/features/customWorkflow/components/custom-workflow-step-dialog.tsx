'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/spinner';

import {
  ActionTypeEnum,
  ActionTypeDisplay,
  CustomWorkflowTargetTypeEnum,
  CustomWorkflowTargetTypeEnumDisplay,
  CreateWorkflowStepPayload,
  CustomWorkflowStepDetails
} from '@/features/customWorkflow/types/customWorkflow';
import { customWorkflowService } from '@/features/customWorkflow/api/customWorkflow.service';
import {
  customWorkflowStepFormSchema,
  CustomWorkflowStepFormValues
} from '../utils/customWorkflow';
import { useAuthApi } from '@/hooks/use-auth-api';
import { IOrganizationalUnitDetails } from '@/features/organizational-unit/types/organizational';
import { useSearchUnit } from '@/hooks/use-search-unit';
import { useSearchUser } from '@/hooks/use-search-user';
import { UserDetailed } from '@/features/users/types/user';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { useRouter } from 'next/navigation';

interface CustomWorkflowStepDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workflowId: string;
  initialData?: CustomWorkflowStepDetails | null;
  onSuccess?: () => void;
}

export default function CustomWorkflowStepDialog({
  isOpen,
  onClose,
  workflowId,
  initialData = null,
  onSuccess
}: CustomWorkflowStepDialogProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [userSearchValue, setUserSearchValue] = useState('');
  const [debouncedUserSearch, setDebouncedUserSearch] = useState('');
  const [unitSearchValue, setUnitSearchValue] = useState('');
  const [debouncedUnitSearch, setDebouncedUnitSearch] = useState('');
  const [userPopoverOpenBool, setUserPopoverOpenBool] = useState(false);
  const [unitPopoverOpenBool, setUnitPopoverOpenBool] = useState(false);

  const { authApiCall } = useAuthApi();

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

  // No array of recipient types in this dialog (single step). We'll watch the form value instead.

  const form = useForm<CustomWorkflowStepFormValues>({
    resolver: zodResolver(customWorkflowStepFormSchema),
    defaultValues: initialData
      ? {
          stepOrder: initialData.stepOrder,
          actionType: initialData.actionType as ActionTypeEnum,
          targetType: initialData.targetType as CustomWorkflowTargetTypeEnum,
          targetIdentifier: initialData.targetIdentifier,
          defaultInstructionText: initialData.defaultInstructionText || '',
          defaultDueDateOffsetDays: initialData.defaultDueDateOffsetDays
        }
      : {
          stepOrder: 1,
          defaultDueDateOffsetDays: 0
        }
  });

  const watchedTargetType = form.watch('targetType');

  const onSubmit = async (data: CustomWorkflowStepFormValues) => {
    try {
      setLoading(true);

      const payload: CreateWorkflowStepPayload = {
        ...data,
        workflowId
      };

      if (initialData) {
        payload.id = initialData.id;
        const response = await authApiCall(async () =>
          customWorkflowService.updateCustomWorkflowStep(payload)
        );

        if (response?.succeeded) {
          toast.success('تم تحديث خطوة سير العمل بنجاح!');
          onSuccess?.();
          onClose();
          router.refresh();
        } else {
          toast.error('فشل في تحديث خطوة سير العمل!');
        }
      } else {
        const response = await authApiCall(async () =>
          customWorkflowService.createCustomWorkflowStep(payload)
        );

        if (response?.succeeded) {
          toast.success('تم إنشاء خطوة سير العمل بنجاح!');
          onSuccess?.();
          onClose();
          router.refresh();
        } else {
          toast.error('فشل في إنشاء خطوة سير العمل!');
        }
      }
    } catch (error) {
      // Error handled by user-facing toast
      toast.error('حدث خطأ أثناء حفظ خطوة سير العمل!');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'تعديل خطوة سير العمل' : 'إضافة خطوة سير العمل'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'قم بتعديل تفاصيل خطوة سير العمل'
              : 'قم بإضافة خطوة جديدة إلى سير العمل'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='stepOrder'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ترتيب الخطوة</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='1'
                        disabled={loading}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='defaultDueDateOffsetDays'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عدد أيام الاستحقاق</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='0'
                        disabled={loading}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='actionType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الإجراء</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl className='col-span-1 w-full'>
                      <SelectTrigger>
                        <SelectValue placeholder='اختر نوع الإجراء' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(ActionTypeDisplay).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
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
              name='targetType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع المستلم الأساسي</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                    }}
                    value={field.value?.toString()}
                  >
                    <FormControl className='w-full'>
                      <SelectTrigger>
                        <SelectValue placeholder='اختر نوع المستلم' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(CustomWorkflowTargetTypeEnumDisplay).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              {watchedTargetType ===
              CustomWorkflowTargetTypeEnum.SpecificUser ? (
                <FormField
                  control={form.control}
                  name='targetIdentifier'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>اسم الموظف</FormLabel>
                      <Popover
                        open={userPopoverOpenBool}
                        onOpenChange={(open) =>
                          setUserPopoverOpenBool(Boolean(open))
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
                                        `targetIdentifier`,
                                        user.id
                                      );
                                      setUserPopoverOpenBool(false);
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
                  name='targetIdentifier'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>الجهة الأساسية</FormLabel>
                      <Popover
                        open={unitPopoverOpenBool}
                        onOpenChange={(open) =>
                          setUnitPopoverOpenBool(Boolean(open))
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
                                          `targetIdentifier`,
                                          unit.id || ''
                                        );
                                        setUnitPopoverOpenBool(false);
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
              name='defaultInstructionText'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نص التعليمات الافتراضي</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='أدخل التعليمات الافتراضية للخطوة...'
                      disabled={loading}
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={loading}
              >
                إلغاء
              </Button>
              <Button type='submit' disabled={loading}>
                {loading && <Spinner className='mr-2 h-4 w-4' />}
                {initialData ? 'تحديث' : 'إضافة'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
