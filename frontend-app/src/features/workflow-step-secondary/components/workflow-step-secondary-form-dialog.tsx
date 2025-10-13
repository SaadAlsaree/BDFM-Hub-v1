'use client';

import { useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  RecipientTypeDisplay,
  RecipientTypeEnum
} from '../types/workflow-step-secondary';
import { useAuthApi } from '@/hooks/use-auth-api';

import { workflowStepSecondaryService } from '../api/workflow-step-secondary.service';
import {
  WorkflowStepSecondaryCreateSchema,
  WorkflowStepSecondaryUpdateSchema,
  type WorkflowStepSecondaryCreateFormData,
  type WorkflowStepSecondaryUpdateFormData
} from '../utils/workflow-step-secondary';
import { Plus, Edit, ChevronsUpDown, Check } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { useSearchUser } from '@/hooks/use-search-user';
import { useSearchUnit } from '@/hooks/use-search-unit';
import { IOrganizationalUnitDetails } from '@/features/organizational-unit/types/organizational';
import { Spinner } from '@/components/spinner';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface WorkflowStepSecondaryFormDialogProps {
  stepId: string;
  trigger?: React.ReactNode;
  defaultValues?: Partial<
    WorkflowStepSecondaryCreateFormData | WorkflowStepSecondaryUpdateFormData
  >;
  mode?: 'create' | 'update';
}

export function WorkflowStepSecondaryFormDialog({
  stepId,
  trigger,
  defaultValues,
  mode = 'create'
}: WorkflowStepSecondaryFormDialogProps) {
  const [open, setOpen] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  const [recipientType, setRecipientType] = useState<RecipientTypeEnum>(
    RecipientTypeEnum.User
  );
  const [userSearchValue, setUserSearchValue] = useState('');
  const [debouncedUserSearch, setDebouncedUserSearch] = useState('');
  const [unitSearchValue, setUnitSearchValue] = useState('');
  const [debouncedUnitSearch, setDebouncedUnitSearch] = useState('');
  const [userPopoverOpen, setUserPopoverOpen] = useState<boolean>(false);
  const [unitPopoverOpen, setUnitPopoverOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const { authApiCall } = useAuthApi();
  const router = useRouter();

  const isUpdateMode = mode === 'update';

  const form = useForm({
    resolver: zodResolver(
      isUpdateMode
        ? WorkflowStepSecondaryUpdateSchema
        : WorkflowStepSecondaryCreateSchema
    ),
    defaultValues: {
      stepId: stepId,
      recipientType: RecipientTypeEnum.User,
      recipientId: '',
      purpose: '',
      instructionText: '',
      ...(isUpdateMode && { id: '' }),
      ...defaultValues
    }
  });

  // Set stepId to form
  form.setValue('stepId', stepId);

  async function onFormSubmit(data: any) {
    setLoading(true);
    try {
      let response;

      if (isUpdateMode) {
        response = await authApiCall(() =>
          workflowStepSecondaryService.updateWorkflowStepSecondary(data)
        );
        if (response?.succeeded) {
          toast.success(
            `${isUpdateMode ? 'تم تحديث' : 'تم إنشاء'} المستلم الثانوي بنجاح`
          );
          setOpen(false);
          form.reset();
          setLoading(false);
          router.refresh();
        }
      } else {
        response = await authApiCall(() =>
          workflowStepSecondaryService.createWorkflowStepSecondary(data)
        );
        if (response?.succeeded) {
          toast.success(
            `${isUpdateMode ? 'تم تحديث' : 'تم إنشاء'} المستلم الثانوي بنجاح`
          );
          setOpen(false);
          form.reset();
          setLoading(false);
          router.refresh();
        }
      }

      if (response) {
        setOpen(false);
        form.reset();
      }
    } catch (error) {
      // swallow or handle error as needed
    } finally {
      setLoading(false);
    }
  }

  const onRecipientTypeChange = (value: RecipientTypeEnum) => {
    setRecipientType(value);
    form.setValue('recipientType', value);
  };

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

  const users = userList?.data || [];

  // Unit Search using existing hook
  const {
    data: unitList,
    isLoading: isUnitLoading,
    error: unitError
  } = useSearchUnit({
    unit: debouncedUnitSearch
  });

  const units: IOrganizationalUnitDetails[] = unitList?.data || [];

  const handleUserSearch = (searchText: string) => {
    setUserSearchValue(searchText);
  };

  const handleUnitSearch = (searchText: string) => {
    setUnitSearchValue(searchText);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant='outline' className='w-full'>
            {isUpdateMode ? (
              <>
                <Edit className='h-4 w-4' />
                تعديل مستلم ثانوي
              </>
            ) : (
              <>
                <Plus className='h-4 w-4' />
                إضافة مستلم ثانوي
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] w-[600px] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {isUpdateMode ? 'تعديل مستلم ثانوي' : 'إضافة مستلم ثانوي'}
          </DialogTitle>
          <DialogDescription>
            {isUpdateMode
              ? 'قم بتعديل بيانات المستلم الثانوي'
              : 'املأ النموذج أدناه لإضافة مستلم ثانوي جديد'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onFormSubmit)}
            className='space-y-6'
          >
            {isUpdateMode && <Input type='hidden' {...form.register('id')} />}

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='recipientType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع المستلم</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const enumValue = Number(value) as RecipientTypeEnum;
                        field.onChange(enumValue);
                        onRecipientTypeChange(enumValue);
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

              <div className='col-span-1'>
                {recipientType === RecipientTypeEnum.User ? (
                  <FormField
                    control={form.control}
                    name='recipientId'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>معرف المستخدم</FormLabel>
                        <Popover
                          open={userPopoverOpen}
                          onOpenChange={(open) => setUserPopoverOpen(open)}
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
                                      (user: any) => user.id === field.value
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
                                        form.setValue('recipientId', user.id);
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
                ) : recipientType === RecipientTypeEnum.Unit ? (
                  <FormField
                    control={form.control}
                    name='recipientId'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>الجهة</FormLabel>
                        <Popover
                          open={unitPopoverOpen}
                          onOpenChange={(open) => setUnitPopoverOpen(open)}
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
                                            'recipientId',
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
                ) : (
                  <FormField
                    control={form.control}
                    name='recipientId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>معرف الجهة الخارجية</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='أدخل معرف الجهة الخارجية'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name='purpose'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الغرض</FormLabel>
                  <FormControl>
                    <Input placeholder='أدخل الغرض من التحويل' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='instructionText'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظة التحويل</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='أدخل ملاحظة التحويل'
                      className='min-h-[100px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                إلغاء
              </Button>
              <Button disabled={loading} type='submit'>
                {isUpdateMode ? 'تحديث' : 'إضافة'} مستلم ثانوي
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

export default WorkflowStepSecondaryFormDialog;
