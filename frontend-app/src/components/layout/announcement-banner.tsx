'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { IconX, IconInfoCircle, IconUser, IconBuilding, IconCalendar } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Marquee,
  MarqueeContent,
  MarqueeEdge,
  MarqueeItem,
} from '@/components/ui/marquee';

import { useActiveAnnouncements } from '@/features/announcements/api/use-announcements';
import { formatDateWithArabicNumerals } from '@/utils/arabic-numerals';

interface AnnouncementBannerProps {
  /**
   * The announcement message to display
   */
  message?: string;
  /**
   * Optional variant for different banner styles
   */
  variant?: 'info' | 'warning' | 'success';
  /**
   * Storage key for localStorage persistence
   */
  storageKey?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

interface AnnouncementContextType {
  isVisible: boolean;
  toggleVisibility: () => void;
  isClient: boolean;
}

const AnnouncementContext = createContext<AnnouncementContextType | null>(null);

export function useAnnouncement() {
  const context = useContext(AnnouncementContext);
  if (!context) {
    return { isVisible: true, toggleVisibility: () => {}, isClient: false };
  }
  return context;
}

const itemStyles = {
  info: 'border-l-4 border-l-blue-500 dark:border-l-blue-400 border-blue-200 dark:border-blue-800/50',
  warning: 'border-l-4 border-l-amber-500 dark:border-l-amber-400 border-amber-200 dark:border-amber-800/50',
  success: 'border-l-4 border-l-emerald-500 dark:border-l-emerald-400 border-emerald-200 dark:border-emerald-800/50',
};

// Provider component to wrap the layout
export function AnnouncementProvider({
  children,
  storageKey = 'announcement-banner-visible',
}: {
  children: React.ReactNode;
  storageKey?: string;
}) {
  const [isVisible, setIsVisible] = useState(true); // Default to true (open)
  const [isClient, setIsClient] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setIsClient(true);
    // Check localStorage for visibility state
    const stored = localStorage.getItem(storageKey);
    if (stored === null) {
      // First time - show banner by default
      setIsVisible(true);
    } else {
      setIsVisible(stored === 'true');
    }
  }, [storageKey]);

  const toggleVisibility = () => {
    const newState = !isVisible;
    setIsVisible(newState);
    localStorage.setItem(storageKey, String(newState));
  };

  return (
    <AnnouncementContext.Provider
      value={{ isVisible, toggleVisibility, isClient }}
    >
      {children}
    </AnnouncementContext.Provider>
  );
}

// Banner component
export function AnnouncementBanner({
  className,
}: Omit<AnnouncementBannerProps, 'storageKey' | 'message' | 'variant'>) {
  const { isVisible, toggleVisibility, isClient } = useAnnouncement();
  const { data: announcementData, isLoading } = useActiveAnnouncements({page:1,pageSize:100});

  const handleClose = () => {
    toggleVisibility();
  };

  // Don't render on server to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  const announcements = announcementData?.data?.items || [];

  if (!isLoading && announcements.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-in-out overflow-hidden',
        isVisible ? 'max-h-50 opacity-100' : 'max-h-0 opacity-0'
      )}
    >
      <div
        className={cn(
          'relative border-b shadow-md bg-background/50 backdrop-blur-sm px-4 py-2',
          className
        )}
      >
        <div className=" w-full flex items-center justify-between gap-4">
          {/* Icon and Marquee */}
          <div className="flex flex-1 items-center gap-3 overflow-hidden">
            {isLoading ? (
              <div className="flex w-full items-center justify-center py-4">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="mr-2 text-xs opacity-70">جاري تحميل الإعلانات...</span>
              </div>
            ) : (
              <Marquee dir="rtl" className="py-2">
                <MarqueeContent>
                  {announcements.map((announcement) => (
                    <MarqueeItem key={announcement.id} asChild>
                      <div className={cn(
                        "flex w-[700px] flex-col gap-2 rounded-lg border p-4 shadow-md hover:shadow-lg hover:border-primary/50 transition-all duration-200",
                        itemStyles[(announcement.variant as 'info' | 'warning' | 'success') || 'info']
                      )}>
                        {/* Header: Title */}
                        <div className="flex items-start gap-2 pb-2 border-b border-current/10">
                          <IconInfoCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h3 className="text-sm font-bold leading-tight">
                              {announcement.title}
                            </h3>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="line-clamp-2 text-xs leading-relaxed opacity-90">
                          {announcement.description}
                        </p>

                        {/* Metadata Footer */}
                        <div className="flex flex-row items-center justify-between gap-2 pt-2 border-t border-current/10 text-[10px] opacity-75">
                          {/* User & Organization */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* User */}
                            <div className="flex items-center gap-1.5">
                              <IconUser className="h-3 w-3 flex-shrink-0" />
                              <span className="font-medium truncate">{announcement.userFullName}</span>
                            </div>
                            
                            {/* Organization */}
                            <div className="flex items-center gap-1.5 min-w-0">
                              <IconBuilding className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{announcement.unitName}</span>
                            </div>
                          </div>
                          
                          {/* Date */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <IconCalendar className="h-3 w-3 flex-shrink-0" />
                            <span dir="ltr">{formatDateWithArabicNumerals(announcement.createAt)}</span>
                          </div>
                        </div>
                      </div>
                    </MarqueeItem>
                  ))}
                </MarqueeContent>
                <MarqueeEdge side="left" className="w-12 bg-gradient-to-r from-background to-transparent" />
                <MarqueeEdge side="right" className="w-12 bg-gradient-to-l from-background to-transparent" />
              </Marquee>
            )}
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 flex-shrink-0 hover:bg-black/10 dark:hover:bg-white/10"
            aria-label="إغلاق الإعلان"
          >
            <IconX className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
