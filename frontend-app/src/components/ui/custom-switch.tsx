'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CustomSwitchProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  switchClassName?: string;
}

function CustomSwitch({
  id,
  checked = false,
  onCheckedChange,
  label = 'Toggle me',
  disabled = false,
  className,
  labelClassName,
  switchClassName,
  ...props
}: CustomSwitchProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onCheckedChange) {
      onCheckedChange(event.target.checked);
    }
  };

  return (
    <label
      className={cn(
        'inline-flex cursor-pointer items-center',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <input
        type='checkbox'
        id={id}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className='peer sr-only'
        {...props}
      />
      <div
        className={cn(
          "peer peer-checked:bg-primary peer-focus:ring-primary/20 relative h-6 w-11 rounded-full bg-gray-200 peer-focus:ring-4 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-blue-600 dark:peer-focus:ring-blue-800",
          switchClassName
        )}
      />
      <span
        className={cn(
          'ms-3 text-sm font-medium text-gray-900 dark:text-gray-300',
          labelClassName
        )}
      >
        {label}
      </span>
    </label>
  );
}

export { CustomSwitch };
export type { CustomSwitchProps };
