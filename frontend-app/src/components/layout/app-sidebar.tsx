'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { navItems } from '@/constants/data';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  IconBell,
  IconChevronRight,
  IconChevronsDown,
  IconLogout,
  IconPhotoUp,
  IconPlus
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import { OrgSwitcher } from '../org-switcher';
import { signOut } from 'next-auth/react';
import { Button } from '../ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import AppSidebarLoading from './app-sidebar-loading';
import { hasAnyRole, hasAnyPermission } from '@/utils/auth/auth-utils';
import { UserDto } from '@/utils/auth/auth';
import { useCorrespondencesSummary } from '@/hooks/use-correspondences-summary';
import CorrespondenceCountBadge from './correspondence-count-badge';

export const company = {
  name: 'نضام الصلاحيات',
  logo: IconPhotoUp,
  plan: 'Enterprise'
};

const tenants = [{ id: '1', name: 'منصة الادارة المركزية' }];

export default function AppSidebar() {
  const pathname = usePathname();

  const { isOpen } = useMediaQuery();
  const router = useRouter();
  const handleSwitchTenant = (/* tenantId: string */) => {
    // Tenant switching functionality would be implemented here
  };

  const { error, isLoading, user } = useCurrentUser();
  const { data: correspondencesSummary, isLoading: isLoadingSummary } =
    useCorrespondencesSummary({});

  const activeTenant = tenants[0];

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

  // create skeleton for the sidebar
  if (isLoading) {
    return <AppSidebarLoading />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Sidebar side='right' collapsible='offcanvas' variant='floating'>
      <SidebarHeader>
        <OrgSwitcher
          tenants={tenants}
          defaultTenant={activeTenant}
          onTenantSwitch={handleSwitchTenant}
        />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel></SidebarGroupLabel>
          <SidebarMenu>
            {/* Create Section */}
            {hasAnyRole(user as UserDto, ['Correspondence', 'SuAdmin']) &&
              hasAnyPermission(user as UserDto, ['Correspondence|Create']) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className='mb-6 w-full'>
                    <Button className='flex w-full items-center justify-between'>
                      <p className='mr-2'>جديد</p>
                      <IconPlus className='mr-2 h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='w-56'>
                    <DropdownMenuLabel>أنشاء كتاب جديد</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {hasAnyPermission(user as UserDto, [
                      'Access|All',
                      'Correspondence|Create|Draft'
                    ]) && (
                        <DropdownMenuItem
                          onClick={() => router.push('/correspondence/mail-form')}
                        >
                          كتاب مسودة
                        </DropdownMenuItem>
                      )}
                    {hasAnyPermission(user as UserDto, [
                      'Correspondence|Create|External',
                      'Access|All'
                    ]) && (
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              '/correspondence/register-incoming-external-mail'
                            )
                          }
                        >
                          وارد خارجي
                        </DropdownMenuItem>
                      )}
                    {hasAnyPermission(user as UserDto, [
                      'Correspondence|Create|External',
                      'Access|All'
                    ]) && (
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              '/correspondence/create-outgoing-external-mail'
                            )
                          }
                        >
                          صادر خارجي
                        </DropdownMenuItem>
                      )}
                    {hasAnyPermission(user as UserDto, [
                      'Correspondence|Create|Internal',
                      'Access|All'
                    ]) && (
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              '/correspondence/create-incoming-internal-book'
                            )
                          }
                        >
                          وارد داخلي
                        </DropdownMenuItem>
                      )}
                    {hasAnyPermission(user as UserDto, [
                      'Correspondence|Create|Internal',
                      'Access|All'
                    ]) && (
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              '/correspondence/create-outgoing-internal-book'
                            )
                          }
                        >
                          صادر داخلي
                        </DropdownMenuItem>
                      )}
                    {hasAnyPermission(user as UserDto, [
                      'Correspondence|Create|Memorandum',
                      'Access|All'
                    ]) && (
                        <DropdownMenuItem
                          onClick={() =>
                            router.push('/correspondence/create-memorandum')
                          }
                        >
                          مطالعة\مذكرة
                        </DropdownMenuItem>
                      )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            {/* End Create Section */}
            {navItems.map((item) => {
              const hasRequiredRoles = hasAnyRole(
                user as UserDto,
                item.requiredRoles || []
              );
              const hasRequiredPermissions = hasAnyPermission(
                user as UserDto,
                item.requiredPermissions || []
              );

              // Check if user has either required roles OR required permissions (not both)
              const hasParentAccess =
                ((item.requiredRoles?.length ?? 0) > 0 && hasRequiredRoles) ||
                ((item.requiredPermissions?.length ?? 0) > 0 &&
                  hasRequiredPermissions) ||
                (!(item.requiredRoles?.length ?? 0) &&
                  !(item.requiredPermissions?.length ?? 0));

              if (!hasParentAccess) {
                return null;
              }

              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className='group/collapsible'
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={pathname === item.url}
                      >
                        {item.icon && <Icon />}
                        <span>{item.title}</span>
                        <IconChevronRight className='mr-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          // Check permissions for each sub-item
                          const hasSubItemRoles = hasAnyRole(
                            user as UserDto,
                            subItem.requiredRoles || []
                          );
                          const hasSubItemPermissions = hasAnyPermission(
                            user as UserDto,
                            subItem.requiredPermissions || []
                          );

                          // Check if user has either required roles OR required permissions for sub-item
                          const hasSubItemAccess =
                            ((subItem.requiredRoles?.length ?? 0) > 0 &&
                              hasSubItemRoles) ||
                            ((subItem.requiredPermissions?.length ?? 0) > 0 &&
                              hasSubItemPermissions) ||
                            (!(subItem.requiredRoles?.length ?? 0) &&
                              !(subItem.requiredPermissions?.length ?? 0));

                          if (!hasSubItemAccess) {
                            return null;
                          }

                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.url}
                              >
                                <Link href={subItem.url}>
                                  <div className='flex items-center gap-2'>
                                    <span>{subItem.title}</span>
                                    {/* Show count badge for 'All correspondences' */}
                                    {subItem.url === '/correspondence' && (
                                      <CorrespondenceCountBadge
                                        isLoading={isLoadingSummary}
                                        count={
                                          correspondencesSummary?.totalCorrespondences
                                        }
                                      />
                                    )}
                                    {subItem.url ===
                                      '/correspondence/pending-books' && (
                                        <CorrespondenceCountBadge
                                          isLoading={isLoadingSummary}
                                          count={
                                            correspondencesSummary?.totalCorrespondencesPending
                                          }
                                        />
                                      )}
                                    {subItem.url ===
                                      '/correspondence/processing-books' && (
                                        <CorrespondenceCountBadge
                                          isLoading={isLoadingSummary}
                                          count={
                                            correspondencesSummary?.totalCorrespondencesUnderProcessing
                                          }
                                        />
                                      )}
                                    {subItem.url ===
                                      '/correspondence/return-for-editing' && (
                                        <CorrespondenceCountBadge
                                          isLoading={isLoadingSummary}
                                          count={
                                            correspondencesSummary?.totalCorrespondencesReturnedForModification
                                          }
                                        />
                                      )}
                                    {subItem.url ===
                                      '/correspondence/completed-books' && (
                                        <CorrespondenceCountBadge
                                          isLoading={isLoadingSummary}
                                          count={
                                            correspondencesSummary?.totalCorrespondencesCompleted
                                          }
                                        />
                                      )}
                                  </div>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  <UserAvatarProfile className='h-8 w-8 rounded-lg' showInfo />
                  <IconChevronsDown className='mr-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='px-1 py-1.5'>
                    <UserAvatarProfile
                      className='h-8 w-8 rounded-lg'
                      showInfo
                    />
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  {/* <DropdownMenuItem
                    onClick={() => router.push('/dashboard/profile')}
                  >
                    <IconUserCircle className='mr-2 h-4 w-4' />
                    الملف الشخصي
                  </DropdownMenuItem> */}

                  <DropdownMenuItem>
                    <IconBell className='mr-2 h-4 w-4' />
                    الإشعارات
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <IconLogout className='mr-2 h-4 w-4' />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
