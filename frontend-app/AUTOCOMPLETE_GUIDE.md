# دليل استخدام ميزة Autocomplete

## نظرة عامة

هذا الدليل يوضح كيفية إنشاء مكونات autocomplete قابلة لإعادة الاستخدام مع بيانات مختلفة باستخدام Shadcn UI و Next.js.

## المكون الأساسي: Autocomplete Component

### 1. إنشاء المكون الأساسي

```typescript
// components/ui/autocomplete.tsx
'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface AutocompleteOption {
  value: string;
  label: string;
  [key: string]: any; // للبيانات الإضافية
}

interface AutocompleteProps {
  options: AutocompleteOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  onSelect?: (option: AutocompleteOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loadingMessage?: string;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onSearch?: (searchText: string) => void;
  clearable?: boolean;
  onClear?: () => void;
}

export function Autocomplete({
  options,
  value,
  onValueChange,
  onSelect,
  placeholder = "اختر عنصر...",
  searchPlaceholder = "بحث...",
  emptyMessage = "لا توجد نتائج",
  loadingMessage = "جاري البحث...",
  className,
  disabled = false,
  isLoading = false,
  onSearch,
  clearable = false,
  onClear,
}: AutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  const selectedOption = options.find(option => option.value === value);

  const handleSearch = (searchText: string) => {
    setSearchValue(searchText);
    onSearch?.(searchText);
  };

  const handleSelect = (option: AutocompleteOption) => {
    onValueChange?.(option.value);
    onSelect?.(option);
    setOpen(false);
  };

  const handleClear = () => {
    onValueChange?.('');
    onClear?.();
    setSearchValue('');
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", className)}
            disabled={disabled}
          >
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <div className="relative">
              <CommandInput
                placeholder={searchPlaceholder}
                className="h-9"
                value={searchValue}
                onValueChange={handleSearch}
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
            <CommandList>
              <CommandEmpty>
                {isLoading ? loadingMessage : emptyMessage}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option)}
                  >
                    {option.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {clearable && (
        <Button
          variant="outline"
          size="icon"
          onClick={handleClear}
          disabled={!value}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
```

## أمثلة الاستخدام

### 1. Autocomplete للمستخدمين

```typescript
// components/user-autocomplete.tsx
'use client';

import { useState, useEffect } from 'react';
import { Autocomplete } from '@/components/ui/autocomplete';
import { userService } from '@/services/user.service';

interface User {
  id: string;
  name: string;
  email: string;
  department: string;
}

interface UserAutocompleteProps {
  onSelect?: (user: User) => void;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function UserAutocomplete({ onSelect, value, onValueChange }: UserAutocompleteProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleSearch = async (searchText: string) => {
    if (searchText.length < 2) return;

    setIsLoading(true);
    try {
      const response = await userService.searchUsers(searchText);
      setUsers(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const options = users.map(user => ({
    value: user.id,
    label: `${user.name} (${user.email})`,
    ...user
  }));

  return (
    <Autocomplete
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
    />
  );
}
```

### 2. Autocomplete للمنتجات

```typescript
// components/product-autocomplete.tsx
'use client';

import { useState } from 'react';
import { Autocomplete } from '@/components/ui/autocomplete';
import { productService } from '@/services/product.service';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

interface ProductAutocompleteProps {
  onSelect?: (product: Product) => void;
  value?: string;
  onValueChange?: (value: string) => void;
  category?: string;
}

export function ProductAutocomplete({
  onSelect,
  value,
  onValueChange,
  category
}: ProductAutocompleteProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (searchText: string) => {
    if (searchText.length < 2) return;

    setIsLoading(true);
    try {
      const response = await productService.searchProducts({
        searchText,
        category,
        limit: 20
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const options = products.map(product => ({
    value: product.id,
    label: `${product.name} - ${product.price} ريال`,
    ...product
  }));

  return (
    <Autocomplete
      options={options}
      value={value}
      onValueChange={onValueChange}
      onSelect={(option) => onSelect?.(option as Product)}
      placeholder="اختر منتج..."
      searchPlaceholder="ابحث عن منتج..."
      emptyMessage="لا توجد منتجات"
      loadingMessage="جاري البحث عن المنتجات..."
      isLoading={isLoading}
      onSearch={handleSearch}
      clearable
    />
  );
}
```

### 3. Autocomplete للدول والمدن

```typescript
// components/country-autocomplete.tsx
'use client';

import { useState, useEffect } from 'react';
import { Autocomplete } from '@/components/ui/autocomplete';
import { locationService } from '@/services/location.service';

interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
}

interface CountryAutocompleteProps {
  onSelect?: (country: Country) => void;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function CountryAutocomplete({ onSelect, value, onValueChange }: CountryAutocompleteProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    setIsLoading(true);
    try {
      const response = await locationService.getCountries();
      setCountries(response.data);
    } catch (error) {
      console.error('Error loading countries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (searchText: string) => {
    if (searchText.length < 2) return;

    setIsLoading(true);
    try {
      const response = await locationService.searchCountries(searchText);
      setCountries(response.data);
    } catch (error) {
      console.error('Error searching countries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const options = countries.map(country => ({
    value: country.id,
    label: `${country.flag} ${country.name}`,
    ...country
  }));

  return (
    <Autocomplete
      options={options}
      value={value}
      onValueChange={onValueChange}
      onSelect={(option) => onSelect?.(option as Country)}
      placeholder="اختر دولة..."
      searchPlaceholder="ابحث عن دولة..."
      emptyMessage="لا توجد دول"
      loadingMessage="جاري البحث عن الدول..."
      isLoading={isLoading}
      onSearch={handleSearch}
      clearable
    />
  );
}
```

## استخدام مع React Hook Form

### 1. مع Form Field

```typescript
// components/forms/user-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UserAutocomplete } from '@/components/user-autocomplete';

const userFormSchema = z.object({
  userId: z.string().min(1, 'يجب اختيار مستخدم'),
  department: z.string().min(1, 'يجب إدخال القسم'),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export function UserForm() {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      userId: '',
      department: '',
    },
  });

  const handleUserSelect = (user: any) => {
    form.setValue('userId', user.id);
    // يمكن إضافة منطق إضافي هنا
  };

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>المستخدم</FormLabel>
              <FormControl>
                <UserAutocomplete
                  value={field.value}
                  onValueChange={field.onChange}
                  onSelect={handleUserSelect}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

### 2. مع Multiple Selection

```typescript
// components/multi-autocomplete.tsx
'use client';

import { useState } from 'react';
import { Autocomplete } from '@/components/ui/autocomplete';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface MultiAutocompleteProps {
  options: Array<{ value: string; label: string; [key: string]: any }>;
  values: string[];
  onValuesChange: (values: string[]) => void;
  placeholder?: string;
  maxSelections?: number;
}

export function MultiAutocomplete({
  options,
  values,
  onValuesChange,
  placeholder = "اختر عناصر...",
  maxSelections = 5,
}: MultiAutocompleteProps) {
  const [open, setOpen] = useState(false);

  const selectedOptions = options.filter(option => values.includes(option.value));

  const handleSelect = (option: any) => {
    if (values.includes(option.value)) {
      // إزالة العنصر إذا كان محدداً
      onValuesChange(values.filter(v => v !== option.value));
    } else if (values.length < maxSelections) {
      // إضافة العنصر إذا لم يتجاوز الحد الأقصى
      onValuesChange([...values, option.value]);
    }
  };

  const handleRemove = (value: string) => {
    onValuesChange(values.filter(v => v !== value));
  };

  return (
    <div className="space-y-2">
      {/* عرض العناصر المحددة */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map(option => (
            <Badge key={option.value} variant="secondary" className="flex items-center gap-1">
              {option.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleRemove(option.value)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Autocomplete */}
      <Autocomplete
        options={options}
        value=""
        onSelect={handleSelect}
        placeholder={placeholder}
        disabled={values.length >= maxSelections}
      />
    </div>
  );
}
```

## استخدام مع Server Components

### 1. Server-Side Search

```typescript
// app/users/page.tsx
import { Suspense } from 'react';
import { UserAutocomplete } from '@/components/user-autocomplete';
import { userService } from '@/services/user.service';

interface UsersPageProps {
  searchParams: {
    search?: string;
  };
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const users = await userService.getUsers({
    search: searchParams.search,
    limit: 20,
  });

  return (
    <div className="space-y-4">
      <h1>المستخدمون</h1>
      <Suspense fallback={<div>جاري التحميل...</div>}>
        <UserAutocomplete
          initialOptions={users}
          searchParam="search"
        />
      </Suspense>
    </div>
  );
}
```

### 2. مع URL State Management

```typescript
// components/autocomplete-with-url.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Autocomplete } from '@/components/ui/autocomplete';
import { useCallback, useEffect, useState } from 'react';

interface AutocompleteWithUrlProps {
  options: Array<{ value: string; label: string; [key: string]: any }>;
  paramName: string;
  placeholder?: string;
  onSelect?: (option: any) => void;
}

export function AutocompleteWithUrl({
  options,
  paramName,
  placeholder = "اختر عنصر...",
  onSelect,
}: AutocompleteWithUrlProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState('');

  useEffect(() => {
    const paramValue = searchParams.get(paramName);
    if (paramValue) {
      setValue(paramValue);
    }
  }, [searchParams, paramName]);

  const handleValueChange = useCallback((newValue: string) => {
    setValue(newValue);

    const params = new URLSearchParams(searchParams.toString());
    if (newValue) {
      params.set(paramName, newValue);
    } else {
      params.delete(paramName);
    }

    router.push(`?${params.toString()}`);
  }, [router, searchParams, paramName]);

  const handleSearch = useCallback((searchText: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchText) {
      params.set(`${paramName}_search`, searchText);
    } else {
      params.delete(`${paramName}_search`);
    }

    router.push(`?${params.toString()}`);
  }, [router, searchParams, paramName]);

  return (
    <Autocomplete
      options={options}
      value={value}
      onValueChange={handleValueChange}
      onSelect={onSelect}
      onSearch={handleSearch}
      placeholder={placeholder}
    />
  );
}
```

## نصائح للاستخدام

### 1. تحسين الأداء

```typescript
// استخدام debounce للبحث
import { useCallback } from 'react';
import { debounce } from 'lodash';

const debouncedSearch = useCallback(
  debounce((searchText: string) => {
    // منطق البحث
  }, 300),
  []
);
```

### 2. معالجة الأخطاء

```typescript
// إضافة error handling
const [error, setError] = useState<string | null>(null);

const handleSearch = async (searchText: string) => {
  try {
    setError(null);
    setIsLoading(true);
    const response = await api.search(searchText);
    setOptions(response.data);
  } catch (err) {
    setError('حدث خطأ أثناء البحث');
  } finally {
    setIsLoading(false);
  }
};
```

### 3. التخصيص المتقدم

```typescript
// إضافة custom rendering
const CustomAutocomplete = ({ options, ...props }) => {
  return (
    <Autocomplete
      {...props}
      options={options}
      renderOption={(option) => (
        <div className="flex items-center gap-2">
          <img src={option.avatar} alt="" className="w-6 h-6 rounded-full" />
          <span>{option.label}</span>
          <span className="text-sm text-muted-foreground">{option.role}</span>
        </div>
      )}
    />
  );
};
```

## الخلاصة

هذا الدليل يوفر أساساً قوياً لإنشاء مكونات autocomplete قابلة لإعادة الاستخدام مع:

- ✅ **مرونة عالية**: يمكن استخدامها مع أي نوع من البيانات
- ✅ **أداء محسن**: مع debounce و caching
- ✅ **تجربة مستخدم ممتازة**: مع loading states و error handling
- ✅ **تكامل سهل**: مع React Hook Form و Next.js
- ✅ **قابلية التخصيص**: مع props متعددة للتحكم في السلوك

يمكنك استخدام هذه الأمثلة كنقطة انطلاق لإنشاء مكونات autocomplete مخصصة لاحتياجاتك الخاصة.
