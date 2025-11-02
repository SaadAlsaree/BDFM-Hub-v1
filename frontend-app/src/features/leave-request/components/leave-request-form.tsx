'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { IOrganizationalUnitDetails } from '@/features/organizational-unit/types/organizational';
import { useSearchUnit } from '@/hooks/use-search-unit';
import {
  LeaveRequest,
  LeaveType,
  LeaveTypeDisplay
} from '../types/leave-request';
import { leaveRequestService } from '../api/leave-request.service';
import { useAuthApi } from '@/hooks/use-auth-api';
import {
  createLeaveRequestSchema,
  updateLeaveRequestSchema,
  CreateLeaveRequestFormValues,
  UpdateLeaveRequestFormValues
} from '../utils/leave-request';
import { Spinner } from '@/components/spinner';

interface LeaveRequestFormProps {
  initialData: LeaveRequest | null;
  pageTitle: string;
}

export default function LeaveRequestForm({
  initialData,
  pageTitle
}: LeaveRequestFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [debouncedUnitSearch, setDebouncedUnitSearch] = useState('');
  const [unitPopoverOpen, setUnitPopoverOpen] = useState<boolean>(false);
  const [unitSearchValue, setUnitSearchValue] = useState('');
  const { authApiCall } = useAuthApi();

  // initial values
  const defaultValues = initialData
    ? {
        id: initialData.id!,
        leaveType: initialData.leaveType || LeaveType.RegularDaily,
        startDate: initialData.startDate
          ? new Date(initialData.startDate).toISOString().split('T')[0]
          : '',
        endDate: initialData.endDate
          ? new Date(initialData.endDate).toISOString().split('T')[0]
          : '',
        reason: initialData.reason || ''
      }
    : {
        leaveType: LeaveType.RegularDaily,
        startDate: '',
        endDate: '',
        reason: '',
        employeeId: '',
        organizationalUnitId: ''
      };

  // Debounce unit search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUnitSearch(unitSearchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [unitSearchValue]);

  // form
  const form = useForm<
    CreateLeaveRequestFormValues | UpdateLeaveRequestFormValues
  >({
    resolver: zodResolver(
      initialData ? updateLeaveRequestSchema : createLeaveRequestSchema
    ),
    defaultValues
  });

  // Unit Search using existing hook
  const {
    data: unitList,
    isLoading: isUnitLoading,
    error: unitError
  } = useSearchUnit({
    unit: debouncedUnitSearch
  });

  const units: IOrganizationalUnitDetails[] = unitList?.data || [];

  const handleUnitSearch = (searchText: string) => {
    setUnitSearchValue(searchText);
  };

  // Helper function to convert date string (YYYY-MM-DD) to UTC ISO string
  const convertDateToUTC = (dateString: string): string => {
    if (!dateString) return dateString;

    // Parse the date string and create a UTC date at midnight
    // This ensures PostgreSQL receives a DateTime with Kind=Utc
    const [year, month, day] = dateString.split('-').map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    return utcDate.toISOString();
  };

  // submit
  const onSubmit = async (
    data: CreateLeaveRequestFormValues | UpdateLeaveRequestFormValues
  ) => {
    try {
      setLoading(true);

      // Convert date strings to UTC ISO format for PostgreSQL compatibility
      const processedData = {
        ...data,
        startDate: data.startDate
          ? convertDateToUTC(data.startDate)
          : data.startDate,
        endDate: data.endDate ? convertDateToUTC(data.endDate) : data.endDate
      };

      if (initialData) {
        const response = await authApiCall(() =>
          leaveRequestService.updateLeaveRequest(
            processedData as UpdateLeaveRequestFormValues
          )
        );

        if (response?.succeeded) {
          toast.success('تم تعديل طلب الإجازة بنجاح!');
          router.push('/leave-request');
          router.refresh();
        } else {
          toast.error('لم يتم تعديل طلب الإجازة!');
        }
      } else {
        const response = await authApiCall(() =>
          leaveRequestService.createLeaveRequest(
            processedData as CreateLeaveRequestFormValues
          )
        );

        if (response?.succeeded) {
          toast.success('تم إنشاء طلب الإجازة بنجاح!');
          router.push('/leave-request');
          router.refresh();
        } else {
          toast.error('لم يتم إنشاء طلب الإجازة!');
        }
      }
    } catch (error) {
      console.error({ error });
      toast.error('حدث خطأ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Separator />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='w-full space-y-4'
          >
            <div className='grid gap-4 md:grid-cols-2'>
              {!initialData && (
                <>
                  <FormField
                    control={form.control}
                    name='employeeId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>معرف الموظف</FormLabel>
                        <FormControl>
                          <Input placeholder='أدخل معرف الموظف' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='organizationalUnitId'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>الوحدة التنظيمية</FormLabel>
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
                                  : 'اختر الوحدة التنظيمية (اختياري)'}
                                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className='w-[300px] p-0'>
                            <Command>
                              <CommandInput
                                placeholder='ابحث عن وحدة...'
                                value={unitSearchValue}
                                onValueChange={handleUnitSearch}
                              />
                              <CommandList>
                                <CommandEmpty>
                                  {isUnitLoading
                                    ? 'جاري البحث...'
                                    : unitError
                                      ? 'حدث خطأ في البحث'
                                      : 'لا توجد وحدات'}
                                </CommandEmpty>
                                <CommandGroup>
                                  {units?.map(
                                    (unit: IOrganizationalUnitDetails) => (
                                      <CommandItem
                                        value={unit.unitName}
                                        key={unit.id}
                                        onSelect={() => {
                                          form.setValue(
                                            'organizationalUnitId',
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
                </>
              )}

              <FormField
                control={form.control}
                name='leaveType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع الإجازة</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        value={field.value?.toString() || ''}
                      >
                        <FormControl className='w-full'>
                          <SelectTrigger>
                            <SelectValue placeholder='اختر نوع الإجازة' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.keys(LeaveTypeDisplay).map((key) => {
                            const typeValue = parseInt(key);
                            return (
                              <SelectItem key={key} value={key}>
                                {LeaveTypeDisplay[typeValue as LeaveType]}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='startDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ البداية</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='endDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ النهاية</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='reason'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السبب</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='أدخل سبب الإجازة (اختياري)'
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button disabled={loading} type='submit' className='ml-auto'>
              {initialData ? 'تعديل' : 'إنشاء'}
              {loading && (
                <Spinner variant='default' className='ml-2 h-4 w-4' />
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
