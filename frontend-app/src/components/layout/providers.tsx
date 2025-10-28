'use client';
import React from 'react';
import { ActiveThemeProvider } from '../active-theme';
import AuthProvider from '../auth/auth-provider';
import { NotificationProvider } from '@/contexts/NotificationProvider';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthProvider>
        <NotificationProvider>
          <ActiveThemeProvider initialTheme={activeThemeValue}>
            {children}
          </ActiveThemeProvider>
        </NotificationProvider>
      </AuthProvider>
    </>
  );
}
