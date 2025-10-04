'use client';

import React from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import SearchInput from '../search-input';
import { UserNav } from './user-nav';
import { ThemeSelector } from '../theme-selector';
import { ModeToggle } from './ThemeToggle/theme-toggle';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
// import { useGlobalNotifications } from '@/hooks/useGlobalNotifications';
import { assistantStore, showAIAssistant } from '@/features/ai/store/assistant';
import { Button } from '../ui/button';
import { Bot } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '../ui/tooltip';
import { useStore } from '@tanstack/react-store';

export default function Header() {
  // Initialize global notifications to ensure real-time notifications work on all pages
  // const { isConnected, isSignalRAvailable } = useGlobalNotifications();
  const isAIAssistantVisible = useStore(showAIAssistant);

  // Log for debugging
  // if (process.env.NODE_ENV === 'development') {
  //   console.log(
  //     '🔔 [Header] Global notifications active - SignalR available:',
  //     isSignalRAvailable,
  //     'Connected:',
  //     isConnected
  //   );
  // }

  return (
    <header className='flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
      <div className='flex items-center gap-2 px-4'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-2 h-4' />
        {/* <Breadcrumbs /> */}
      </div>

      <div className='flex items-center gap-2 px-4'>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isAIAssistantVisible ? 'default' : 'ghost'}
                size='sm'
                onClick={assistantStore.toggle}
                className='h-8 w-8 p-0'
              >
                <Bot className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>المساعد الذكي</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {/* <CtaGithub /> */}
        <div className='hidden md:flex'>
          <SearchInput />
        </div>

        <NotificationBell />
        <ThemeSelector />
        <ModeToggle />
        <UserNav />
      </div>
    </header>
  );
}
