import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { AnnouncementBanner, AnnouncementProvider } from '@/components/layout/announcement-banner';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SessionValidator } from '@/components/auth/session-validator';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'منصة أدارة الكتب المركزية',
  description: 'منصة أدارة الكتب المركزية'
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true';
  return (
    <SessionValidator>
      {/* <KBar> */}
        <AnnouncementProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <SidebarInset>
              <Header />
              <AnnouncementBanner />
              {/* page main content */}
              {children}
              {/* page main content ends */}
            </SidebarInset>
          </SidebarProvider>
        </AnnouncementProvider>
      {/* </KBar> */}
    </SessionValidator>
  );
}
