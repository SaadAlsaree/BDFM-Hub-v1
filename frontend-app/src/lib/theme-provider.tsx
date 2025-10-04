'use client';

import * as React from 'react';
import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps
} from 'next-themes';

import { DirectionProvider } from '@radix-ui/react-direction';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <DirectionProvider dir='rtl'>{children}</DirectionProvider>
    </NextThemesProvider>
  );
}
