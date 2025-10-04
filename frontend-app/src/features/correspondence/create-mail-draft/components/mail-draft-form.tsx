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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
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
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  RefreshCcw,
  Loader2
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { mailDraftSchema } from '../utils/mail-draft';
import { MailDraftPayload } from '../types/mail-draft';
import { correspondenceService } from '../../api/correspondence.service';
import {
  PriorityLevelEnumDisplay,
  SecrecyLevelEnumDisplay,
  PersonalityLevelEnumDisplay
} from '@/features/correspondence/types/register-incoming-external-mail';
import MailFileSearch from '@/components/mailFile-search';
import { IMailFileList } from '@/features/mail-files/types/mail-files';
import { Spinner } from '@/components/spinner';
import { useRouter } from 'next/navigation';
import { useAuthApi } from '@/hooks/use-auth-api';
import { CorrespondenceTemplatesList } from '@/features/correspondence-templates/types/correspondence-templates';
import { useSession } from 'next-auth/react';

type MailDraftFormValues = z.infer<typeof mailDraftSchema>;

interface MailDraftFormProps {
  correspondenceId?: string;
  onSuccess?: (draftId: string) => void;
  onCancel?: () => void;
  initialData?: Partial<MailDraftFormValues>;
  correspondenceTemplates: CorrespondenceTemplatesList[];
}

const MailDraftForm = ({
  correspondenceId,
  onSuccess,
  onCancel,
  initialData,
  correspondenceTemplates
}: MailDraftFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMailFile, setSelectedMailFile] =
    useState<IMailFileList | null>(null);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [isRotating, setIsRotating] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const router = useRouter();
  const { data: session } = useSession();
  const { authApiCall } = useAuthApi();

  const form = useForm<MailDraftFormValues>({
    resolver: zodResolver(mailDraftSchema),
    defaultValues: {
      subject: initialData?.subject || '',
      bodyText: initialData?.bodyText || '',
      secrecyLevel: initialData?.secrecyLevel,
      priorityLevel: initialData?.priorityLevel,
      personalityLevel: initialData?.personalityLevel,
      mailDate: initialData?.mailDate || new Date().toISOString().split('T')[0],
      fileId: initialData?.fileId || undefined
    },
    mode: 'onChange'
  });

  // Handle mail file selection
  const handleMailFileSelect = (mailFile: IMailFileList | null) => {
    setSelectedMailFile(mailFile);
    if (mailFile?.id) {
      form.setValue('fileId', mailFile.id);
    } else {
      form.setValue('fileId', undefined);
    }
  };

  const onSubmit = async (data: MailDraftFormValues) => {
    setIsSubmitting(true);

    if (!session?.user?.id) {
      toast.error('يجب عليك تسجيل الدخول لإنشاء كتاب');
      setIsSubmitting(false);
      return;
    }

    try {
      if (!initialData) {
        const payload: MailDraftPayload = {
          subject: data.subject,
          bodyText: data.bodyText,
          secrecyLevel: data.secrecyLevel,
          priorityLevel: data.priorityLevel,
          personalityLevel: data.personalityLevel,
          mailDate: data.mailDate,
          fileId: data.fileId,
          createdByUserId: session?.user?.id
        };

        // if (!data.fileId) {
        //   toast.error('يجب إختيار ألاضبارة لربطه بالكتاب');
        //   return;
        // }

        const result = await authApiCall(() =>
          correspondenceService.createMailDraft(payload)
        );

        if (result?.data) {
          toast.success('تم حفظ الكتاب بنجاح');
          onSuccess?.(result.data);
          form.reset();
          setSelectedMailFile(null);
          router.push(`/correspondence`);
        } else {
          toast.error('حدث خطأ أثناء حفظ الكتاب');
        }
      } else {
        const payload: MailDraftPayload = {
          correspondenceId: correspondenceId,
          subject: data.subject,
          bodyText: data.bodyText,
          secrecyLevel: data.secrecyLevel,
          priorityLevel: data.priorityLevel,
          personalityLevel: data.personalityLevel,
          mailDate: data.mailDate,
          fileId: data.fileId,
          updatedByUserId: session?.user?.id
        };

        const result = await authApiCall(() =>
          correspondenceService.updateCorrespondenceContent(payload)
        );

        if (result?.data) {
          toast.success('تم تعديل الكتاب بنجاح');
          onSuccess?.(correspondenceId || '');
          form.reset();
          setSelectedMailFile(null);
          router.push(`/correspondence`);
        } else {
          toast.error('حدث خطأ أثناء تعديل الكتاب');
        }
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ الكتاب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemplateSelect = (template: CorrespondenceTemplatesList) => {
    setValue(template.id);
    setOpen(false);
    form.setValue('bodyText', template.bodyText || '');
    form.setValue('subject', template.subject);
  };

  const handleClearTemplate = () => {
    setIsRotating(true);
    setValue('');
    setSearchValue('');
    setIsSearching(false);
    form.setValue('bodyText', '');
    form.setValue('subject', '');

    // Clear search param from URL
    const params = new URLSearchParams(window.location.search);
    params.delete('searchText');
    const newUrl = params.toString()
      ? `?${params.toString()}`
      : window.location.pathname;
    router.push(newUrl);

    setTimeout(() => setIsRotating(false), 1000);
  };

  // Search function that updates URL to trigger server-side search
  const handleSearch = useCallback(
    (searchText: string) => {
      setSearchValue(searchText);

      // Show loading immediately when user types
      if (searchText.trim()) {
        setIsSearching(true);
      } else {
        setIsSearching(false);
      }

      // Debounce the search to avoid too many requests
      const timeoutId = setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        if (searchText.trim()) {
          params.set('searchText', searchText);
        } else {
          params.delete('searchText');
        }
        router.push(`?${params.toString()}`);

        // Hide loading after navigation
        setTimeout(() => setIsSearching(false), 100);
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [router]
  );

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between gap-2'>
        <div className='space-y-2'>
          <h2 className='text-right text-xl font-semibold'>إنشاء كتاب</h2>
          <p className='text-muted-foreground text-right text-sm'>
            أدخل تفاصيل الكتاب لحفظه
          </p>
        </div>
        <div className='flex items-center gap-2'>
          {/* <Autocomplete
             options={options}
      value={value}
      onValueChange={onValueChange}
      onSelect={(option) => onSelect?.(option as User)}
      placeholder="اختر مستخدم..."
      searchPlaceholder="ابحث عن مستخدم..."
      emptyMessage="لا توجد مستخدمين"
      loadingMessage="جاري البحث عن المستخدمين..."
      isLoading={isLoading}
      onSearch={handleSearch}
      clearable
          /> */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                role='combobox'
                aria-expanded={open}
                className='w-[250px] justify-between'
              >
                {value
                  ? correspondenceTemplates.find(
                      (template) => template.id === value
                    )?.templateName
                  : 'حدد نموذج...'}
                <ChevronsUpDown className='opacity-50' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[250px] p-0'>
              <Command>
                <div className='relative'>
                  <CommandInput
                    placeholder='بحث عن نموذج...'
                    className='h-9'
                    value={searchValue}
                    onValueChange={handleSearch}
                  />
                  {isSearching && (
                    <Loader2 className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 animate-spin' />
                  )}
                </div>
                <CommandList>
                  <CommandEmpty>
                    {isSearching ? 'جاري البحث...' : 'لا توجد نماذج'}
                  </CommandEmpty>
                  <CommandGroup>
                    {correspondenceTemplates.map((template) => (
                      <CommandItem
                        key={template.id}
                        value={template.templateName}
                        onSelect={(currentValue) => {
                          setValue(currentValue === value ? '' : currentValue);
                          setOpen(false);
                          handleTemplateSelect(template);
                        }}
                      >
                        {template.templateName}
                        <Check
                          className={cn(
                            'ml-auto',
                            value === template.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button variant='outline' size='icon' onClick={handleClearTemplate}>
            <RefreshCcw
              className={`h-4 w-4 ${isRotating ? 'animate-spin-once' : ''}`}
            />
          </Button>
        </div>
      </div>

      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-6'
          autoComplete='off'
        >
          {/* Subject */}
          <FormField
            control={form.control}
            name='subject'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='block text-right'>
                  موضوع الكتاب *
                </FormLabel>
                <FormControl>
                  <Input dir='rtl' placeholder='أدخل موضوع الكتاب' {...field} />
                </FormControl>
                <FormMessage className='text-right' />
              </FormItem>
            )}
          />

          {/* Internal Number and Date */}
          <div className='grid gap-6 md:grid-cols-2'>
            {/* Internal Number */}

            <FormItem>
              <FormLabel className='block text-right'>رقم الكتاب</FormLabel>
              <FormControl>
                <Input placeholder='سيتم توليده تلقائياً' disabled />
              </FormControl>
              <FormMessage className='text-right' />
            </FormItem>

            {/* Internal Date */}
            <FormField
              control={form.control}
              name='mailDate'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel className='block text-right'>
                    تاريخ الكتاب *
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'flex w-full justify-between pl-3 text-right font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value && field.value !== '' ? (
                            format(new Date(field.value), 'yyyy-MM-dd', {
                              locale: ar
                            })
                          ) : (
                            <span>اختر تاريخ الكتاب</span>
                          )}
                          <CalendarIcon className='h-4 w-4' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) =>
                          field.onChange(
                            date ? date.toISOString().split('T')[0] : ''
                          )
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className='text-right' />
                </FormItem>
              )}
            />
          </div>

          {/* Body Text */}
          <FormField
            control={form.control}
            name='bodyText'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='block text-right'>محتوى الكتاب</FormLabel>
                <FormControl>
                  <Textarea
                    dir='rtl'
                    placeholder='أدخل محتوى الكتاب'
                    className='min-h-[120px]'
                    {...field}
                  />
                </FormControl>
                <FormMessage className='text-right' />
              </FormItem>
            )}
          />

          {/* Mail File Search Section */}
          <div className='space-y-4'>
            <h3 className='text-right text-lg font-medium text-zinc-900 dark:text-zinc-100'>
              ربط بملف (اختياري)
            </h3>
            <div className='space-y-3'>
              <label className='block text-right text-sm font-medium text-zinc-700 dark:text-zinc-300'>
                البحث عن ملف لربطه بالكتاب
              </label>
              <MailFileSearch onSelectMailFile={handleMailFileSelect} />
              {selectedMailFile && (
                <Card className='rounded-md p-3 text-right text-sm'>
                  <CardContent className='p-0'>
                    <p className='mb-1 font-medium'>تم اختيار الملف:</p>
                    <p className='text-zinc-600 dark:text-zinc-400'>
                      {selectedMailFile.name} - {selectedMailFile.fileNumber}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Hidden field for file ID */}
          <FormField
            control={form.control}
            name='fileId'
            render={({ field }) => (
              <FormItem className='hidden'>
                <FormControl>
                  <Input type='hidden' {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Levels Section */}
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            {/* Secrecy Level */}
            <FormField
              control={form.control}
              name='secrecyLevel'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='block text-right'>
                    مستوى السرية
                  </FormLabel>
                  <Select
                    dir='rtl'
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl className='w-full'>
                      <SelectTrigger>
                        <SelectValue placeholder='اختر مستوى السرية' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(SecrecyLevelEnumDisplay).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className='text-right' />
                </FormItem>
              )}
            />

            {/* Priority Level */}
            <FormField
              control={form.control}
              name='priorityLevel'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='block text-right'>
                    مستوى الأولوية
                  </FormLabel>
                  <Select
                    dir='rtl'
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl className='w-full'>
                      <SelectTrigger>
                        <SelectValue placeholder='اختر مستوى الأولوية' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(PriorityLevelEnumDisplay).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className='text-right' />
                </FormItem>
              )}
            />

            {/* Personality Level */}
            <FormField
              control={form.control}
              name='personalityLevel'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='block text-right'>
                    مستوى الشخصية
                  </FormLabel>
                  <Select
                    dir='rtl'
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl className='w-full'>
                      <SelectTrigger>
                        <SelectValue placeholder='اختر مستوى الشخصية' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(PersonalityLevelEnumDisplay).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className='text-right' />
                </FormItem>
              )}
            />
          </div>

          {/* Action Buttons */}
          <div className='flex justify-between pt-6'>
            {onCancel && (
              <Button
                type='button'
                variant='outline'
                onClick={onCancel}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
            )}
            <Button type='submit' disabled={isSubmitting}>
              {initialData ? 'تعديل' : 'حفظ'}
              {isSubmitting && (
                <Spinner variant='default' className='ml-2 h-4 w-4' />
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MailDraftForm;
