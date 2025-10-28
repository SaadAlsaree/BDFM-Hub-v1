'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
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

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { Switch } from '@/components/ui/switch';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useSearchUnit } from '@/hooks/use-search-unit';
import { IOrganizationalUnitDetails } from '@/features/organizational-unit/types/organizational';
import { cn } from '@/lib/utils';

import { correspondenceTemplatesService } from '../api/correspondence-templates.service';
import { CorrespondenceTemplatesDetail } from '../types/correspondence-templates';
import {
  CorrespondenceTemplateFormValues,
  formatCorrespondenceTemplatePayload,
  formSchema
} from '../utils/correspondence-templates';
import { useAuthApi } from '@/hooks/use-auth-api';

interface CorrespondenceTemplatesFormProps {
  initialData?: CorrespondenceTemplatesDetail;
}

export function CorrespondenceTemplatesForm({
  initialData
}: CorrespondenceTemplatesFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [unitSearchValue, setUnitSearchValue] = useState('');
  const [debouncedUnitSearch, setDebouncedUnitSearch] = useState('');
  const [unitPopoverOpenBool, setUnitPopoverOpenBool] = useState(false);
  const currentUser = useCurrentUser();
  const { authApiCall } = useAuthApi();

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

  const units: IOrganizationalUnitDetails[] = useMemo(() => {
    return unitList?.data || [];
  }, [unitList?.data]);

  const handleUnitSearch = useCallback((searchText: string) => {
    setUnitSearchValue(searchText);
  }, []);

  // console.log(currentUser.user);

  const isEditMode = !!initialData?.id;
  const title = isEditMode ? 'تعديل القالب' : 'إنشاء قالب';
  const description = isEditMode
    ? 'تحديث قالب مراسلات موجود'
    : 'إنشاء قالب مراسلات جديد';
  const action = isEditMode ? 'حفظ التغييرات' : 'إنشاء القالب';

  const form = useForm<CorrespondenceTemplateFormValues>({
    resolver: zodResolver(formSchema(initialData || null)),
    defaultValues: {
      id: initialData?.id || undefined,
      templateName: initialData?.templateName || '',
      subject: initialData?.subject || '',
      bodyText: initialData?.bodyText || '',
      organizationalUnitId: initialData?.organizationalUnitId || '',
      status: initialData?.status || 1 // Default to Active
    }
  });

  // Update form values when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      form.reset({
        id: initialData.id || undefined,
        templateName: initialData.templateName || '',
        subject: initialData.subject || '',
        bodyText: initialData.bodyText || '',
        organizationalUnitId: initialData.organizationalUnitId || '',
        status: initialData.status || 1
      });
    }
  }, [initialData, form]);

  // Debug: You can uncomment the following lines for debugging if needed
  // const currentUnitId = form.watch('organizationalUnitId');
  // useEffect(() => {
  //   console.log('Form values:', form.getValues());
  //   console.log('Selected unit ID:', currentUnitId);
  //   console.log('Available units:', units);
  // }, [currentUnitId, units, form]);

  const onSubmit = async (data: CorrespondenceTemplateFormValues) => {
    try {
      setIsLoading(true);
      if (!currentUser.user) {
        toast.error('المستخدم غير مُصادق عليه');
        return;
      }

      // Set additional fields
      data.createBy = currentUser.user.id || '';
      // Keep the selected organizationalUnitId from the form
      data.organizationalUnitId = data.organizationalUnitId || '';

      const payload = formatCorrespondenceTemplatePayload(
        data,
        initialData?.id
      );

      if (isEditMode && initialData?.id) {
        const response = await authApiCall(() =>
          correspondenceTemplatesService.updateCorrespondenceTemplate(
            initialData.id as string,
            payload
          )
        );
        if (response?.data) {
          toast.success('تم تحديث القالب بنجاح');
          router.push('/correspondence-template');
          router.refresh();
          return;
        }
      } else {
        const response = await authApiCall(() =>
          correspondenceTemplatesService.createCorrespondenceTemplate(payload)
        );
        if (response?.data) {
          toast.success('تم إنشاء القالب بنجاح');
          router.push('/correspondence-template');
          router.refresh();
          return;
        }
      }

      toast.error('حدث خطأ أثناء حفظ القالب');
    } catch (error) {
      toast.error('حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='templateName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>أسم القالب</FormLabel>
                    <FormControl>
                      <Input placeholder='أدخل أسم القالب' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='subject'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>أسم الموضوع</FormLabel>
                    <FormControl>
                      <Input placeholder='أدخل أسم الموضوع' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='organizationalUnitId'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>الجهة</FormLabel>
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
                                )?.unitName || `الوحدة المختارة: ${field.value}`
                              : 'اختر الجهة'}
                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-[400px] p-0'>
                        <Command>
                          <CommandInput
                            placeholder='ابحث عن الجهة...'
                            value={unitSearchValue}
                            onValueChange={handleUnitSearch}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {isUnitLoading
                                ? 'جاري البحث...'
                                : unitError
                                  ? 'حدث خطأ في البحث'
                                  : 'لا توجد جهات '}
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

              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>الحالة النشطة</FormLabel>
                      <FormDescription>
                        حدد ما إذا كان هذا القالب نشطًا أم غير نشط
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === 1}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? 1 : 0)
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='bodyText'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نص القالب</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='أدخل نص القالب'
                      className='min-h-[200px] resize-y'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className='mt-6 flex justify-between'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.back()}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {action}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
