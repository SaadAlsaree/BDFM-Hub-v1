import { VariantProps } from 'class-variance-authority';
import { badgeVariants } from './badge';

// Extract badge variant types
export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];
export type BadgeSize = VariantProps<typeof badgeVariants>['size'];

// Color variants for filled style
export type BadgeColorVariant =
    | 'blue'
    | 'gray'
    | 'red'
    | 'green'
    | 'yellow'
    | 'orange'
    | 'indigo'
    | 'purple'
    | 'teal';

// Color variants for outlined style
export type BadgeOutlineVariant =
    | 'blue-outline'
    | 'gray-outline'
    | 'red-outline'
    | 'green-outline'
    | 'yellow-outline'
    | 'orange-outline'
    | 'indigo-outline'
    | 'purple-outline'
    | 'teal-outline';

// All available badge variants
export type AllBadgeVariants =
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | BadgeColorVariant
    | BadgeOutlineVariant;

// Badge size variants
export type BadgeSizeVariant = 'sm' | 'md' | 'lg' | 'xl';

// Badge props interface
export interface BadgeProps extends React.ComponentProps<'span'> {
    variant?: AllBadgeVariants;
    size?: BadgeSizeVariant;
    asChild?: boolean;
}

// Utility type for creating custom badge variants
export type BadgeVariantConfig = {
    [K in AllBadgeVariants]: string;
}; 