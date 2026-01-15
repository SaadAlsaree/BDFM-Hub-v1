'use client';

import React from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import SearchInput from '../search-input';
import { UserNav } from './user-nav';
import { ThemeSelector } from '../theme-selector';
import { ModeToggle } from './ThemeToggle/theme-toggle';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { useAnnouncement } from './announcement-banner';
import { Button } from '../ui/button';
import { IconInfoCircle } from '@tabler/icons-react';
import {
  Marquee,
  MarqueeContent,
  MarqueeEdge,
  MarqueeItem,
} from "@/components/ui/marquee";
// import { useGlobalNotifications } from '@/hooks/useGlobalNotifications';

export default function Header() {
  // Initialize global notifications to ensure real-time notifications work on all pages
  // const { isConnected, isSignalRAvailable } = useGlobalNotifications();

  // Log for debugging
  // if (process.env.NODE_ENV === 'development') {
  //   console.log(
  //     '🔔 [Header] Global notifications active - SignalR available:',
  //     isSignalRAvailable,
  //     'Connected:',
  //     isConnected
  //   );
  // }

  const { isVisible, toggleVisibility, isClient } = useAnnouncement();



  return (
    <header className='flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
      <div className='flex items-center gap-2 px-4'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-2 h-4' />
        {/* <Breadcrumbs /> */}
      </div>

     

      <div className='flex items-center gap-2 px-4'>
        {/* <CtaGithub /> */}
        <div className='hidden md:flex'>
          {/* <SearchInput /> */}
        </div>

        {isClient && !isVisible && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleVisibility}
            className="h-9 w-9"
            title="عرض الإعلان"
          >
            <IconInfoCircle className="h-5 w-5" />
          </Button>
        )}

        <NotificationBell />
        <ThemeSelector />
        <ModeToggle />
        <UserNav />
      </div>
    </header>
  );
}
