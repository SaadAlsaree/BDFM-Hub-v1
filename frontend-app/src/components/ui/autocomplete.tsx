'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
  placeholder = 'اختر عنصر...',
  searchPlaceholder = 'بحث...',
  emptyMessage = 'لا توجد نتائج',
  loadingMessage = 'جاري البحث...',
  className,
  disabled = false,
  isLoading = false,
  onSearch,
  clearable = false,
  onClear
}: AutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  const selectedOption = options.find((option) => option.value === value);

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
    <div className='flex items-center gap-2'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className={cn('w-full justify-between', className)}
            disabled={disabled}
          >
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronsUpDown className='opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-full p-0'>
          <Command>
            <div className='relative'>
              <CommandInput
                placeholder={searchPlaceholder}
                className='h-9'
                value={searchValue}
                onValueChange={handleSearch}
              />
              {isLoading && (
                <Loader2 className='text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin' />
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
                        'ml-auto',
                        value === option.value ? 'opacity-100' : 'opacity-0'
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
          variant='outline'
          size='icon'
          onClick={handleClear}
          disabled={!value}
        >
          <X className='h-4 w-4' />
        </Button>
      )}
    </div>
  );
}
