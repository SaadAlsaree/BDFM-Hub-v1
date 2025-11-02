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
  IOrganizationalUnitDetails,
  UnitType,
  UnitTypeDisplay
} from '@/features/organizational-unit/types/organizational';
import { organizationalService } from '@/features/organizational-unit/api/organizational.service';
import { useAuthApi } from '@/hooks/use-auth-api';
import {
  OrganizationalUnitStatus,
  formSchema,
  OrganizationalUnitFormValues
} from '../utils/organizational';
import { Spinner } from '@/components/spinner';
import { CustomSwitch } from '@/components/ui/custom-switch';
import { useSearchUnit } from '@/hooks/use-search-unit';
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

interface OrganizationalUnitFormProps {
  initialData: IOrganizationalUnitDetails | null;
  pageTitle: string;
}

export default function OrganizationalUnitForm({
  initialData,
  pageTitle
}: OrganizationalUnitFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [debouncedUnitSearch, setDebouncedUnitSearch] = useState('');
  const [unitPopoverOpen, setUnitPopoverOpen] = useState<boolean>(false);
  const [unitSearchValue, setUnitSearchValue] = useState('');
  const { authApiCall } = useAuthApi();

  // Debounce unit search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUnitSearch(unitSearchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [unitSearchValue]);

  // initial values
  const defaultValues = initialData
    ? {
        unitName: initialData.unitName,
        unitCode: initialData.unitCode,
        unitDescription: initialData.unitDescription || '',
        parentUnitId: initialData.parentUnitId || undefined,
        email: initialData.email,
        phoneNumber: initialData.phoneNumber,
        address: initialData.address,
        unitLogo: initialData.unitLogo || undefined,
        unitLevel: initialData.unitLevel,
        canReceiveExternalMail: initialData.canReceiveExternalMail,
        canSendExternalMail: initialData.canSendExternalMail,
        status: initialData.status || OrganizationalUnitStatus.Active,
        unitType: initialData.unitType || UnitType.DEPARTMENT
      }
    : {};

  // form
  const form = useForm<OrganizationalUnitFormValues>({
    resolver: zodResolver(formSchema(initialData)),
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

  console.log(form.formState.errors);

  // submit
  const onSubmit = async (data: OrganizationalUnitFormValues) => {
    try {
      setLoading(true);

      if (initialData) {
        const unitToUpdate = {
          id: initialData.id,
          ...data
        };

        const response = await authApiCall(() =>
          organizationalService.updateOrganizationalUnit(unitToUpdate)
        );

        if (response?.succeeded) {
          toast.success('تم تعديل الجهة بنجاح!');
          router.push('/organizational-unit');
          router.refresh();
        } else {
          toast.error('لم يتم تعديل الجهة!');
        }
      } else {
        const response = await authApiCall(() =>
          organizationalService.createOrganizationalUnit(data)
        );

        if (response?.succeeded) {
          toast.success('تم إنشاء الجهة بنجاح!');
          router.push('/organizational-unit');
          router.refresh();
        } else {
          toast.error('لم يتم إنشاء الجهة!');
        }
      }
    } catch (error) {
      console.error(error);
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
              <FormField
                control={form.control}
                name='unitName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم</FormLabel>
                    <FormControl>
                      <Input placeholder='أدخل الاسم' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='unitCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الكود</FormLabel>
                    <FormControl>
                      <Input placeholder='أدخل الكود' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='parentUnitId'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>الوحدة الأم</FormLabel>
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
                              : 'اختر الوحدة الأم'}
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
                              {units?.map((unit: IOrganizationalUnitDetails) => (
                                <CommandItem
                                  value={unit.unitName}
                                  key={unit.id}
                                  onSelect={() => {
                                    form.setValue(
                                      'parentUnitId',
                                      unit.id || undefined
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='أدخل البريد'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='phoneNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف</FormLabel>
                    <FormControl>
                      <Input placeholder='أدخل رقم الهاتف' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <FormField
                control={form.control}
                name='unitLogo'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>شعار الوحدة</FormLabel>
                    <FormControl>
                      <Input placeholder='أدخل رابط الشعار' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FormField
                control={form.control}
                name='unitType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع الوحدة</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        value={field.value?.toString() || ''}
                      >
                        <FormControl className='w-full'>
                          <SelectTrigger>
                            <SelectValue placeholder='اختر نوع الوحدة' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.keys(UnitTypeDisplay).map((key) => {
                            const typeValue = parseInt(key);
                            return (
                              <SelectItem key={key} value={key}>
                                {UnitTypeDisplay[typeValue as UnitType]}
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
            </div>

            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العنوان</FormLabel>
                    <FormControl>
                      <Input placeholder='أدخل العنوان' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحالة</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString() || ''}
                    >
                      <FormControl className='w-full'>
                        <SelectTrigger>
                          <SelectValue placeholder='اختر الحالة' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem
                          value={OrganizationalUnitStatus.Active.toString()}
                        >
                          مفعل
                        </SelectItem>
                        <SelectItem
                          value={OrganizationalUnitStatus.Inactive.toString()}
                        >
                          غير مفعل
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='unitLevel'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المستوى</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={1}
                        placeholder='أدخل المستوى'
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          field.onChange(isNaN(value) ? 1 : value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>إعدادات البريد</h3>
              <div className='grid gap-8 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='canReceiveExternalMail'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>
                          استلام البريد الخارجي
                        </FormLabel>
                      </div>
                      <FormControl>
                        <CustomSwitch
                          label=''
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='canSendExternalMail'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>
                          إرسال البريد الخارجي
                        </FormLabel>
                      </div>
                      <FormControl>
                        <CustomSwitch
                          label=''
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='unitDescription'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel>الوصف</FormLabel>
                    <FormControl>
                      <Textarea placeholder='أدخل الوصف' {...field} rows={3} />
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
