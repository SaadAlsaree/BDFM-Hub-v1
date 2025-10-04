import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import type { BadgeProps } from './badge-types';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        // Color variants - Filled style
        blue: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        gray: 'border-transparent bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        red: 'border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        green:
          'border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        yellow:
          'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        orange:
          'border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
        indigo:
          'border-transparent bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
        purple:
          'border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        teal: 'border-transparent bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
        // Color variants - Outlined style
        'blue-outline':
          'bg-blue-100 text-blue-800 dark:bg-gray-700 dark:text-blue-400 border border-blue-400',
        'gray-outline':
          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400 border border-gray-500',
        'red-outline':
          'bg-red-100 text-red-800 dark:bg-gray-700 dark:text-red-400 border border-red-400',
        'green-outline':
          'bg-green-100 text-green-800 dark:bg-gray-700 dark:text-green-400 border border-green-400',
        'yellow-outline':
          'bg-yellow-100 text-yellow-800 dark:bg-gray-700 dark:text-yellow-300 border border-yellow-300',
        'orange-outline':
          'bg-orange-100 text-orange-800 dark:bg-gray-700 dark:text-orange-400 border border-orange-400',
        'indigo-outline':
          'bg-indigo-100 text-indigo-800 dark:bg-gray-700 dark:text-indigo-400 border border-indigo-400',
        'purple-outline':
          'bg-purple-100 text-purple-800 dark:bg-gray-700 dark:text-purple-400 border border-purple-400',
        'teal-outline':
          'bg-teal-100 text-teal-800 dark:bg-gray-700 dark:text-teal-400 border border-teal-400'
      },
      size: {
        sm: 'px-2 py-0.5 text-xs [&>svg]:size-3 gap-1',
        md: 'px-2.5 py-1 text-sm [&>svg]:size-4 gap-1.5',
        lg: 'px-3 py-1.5 text-base [&>svg]:size-5 gap-2',
        xl: 'px-4 py-2 text-lg [&>svg]:size-6 gap-2.5'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-slot='badge'
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
export type { BadgeProps } from './badge-types';
