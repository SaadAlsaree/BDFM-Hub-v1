import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { Skeleton } from '../ui/skeleton';

const AppSidebarLoading = () => {
  return (
    <Sidebar side='right' collapsible='offcanvas' variant='floating'>
      <SidebarHeader>
        <div className='p-2'>
          <Skeleton className='h-10 w-full rounded-md' />
        </div>
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel></SidebarGroupLabel>
          <SidebarMenu>
            {/* Create Button Skeleton */}
            <div className='mb-6'>
              <Skeleton className='h-10 w-full rounded-md' />
            </div>

            {/* Navigation Items Skeleton */}
            {Array.from({ length: 6 }).map((_, index) => (
              <SidebarMenuItem key={index}>
                <div className='flex items-center space-x-2 p-2'>
                  <Skeleton className='h-5 w-5 rounded' />
                  <Skeleton className='h-4 flex-1 rounded' />
                </div>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className='flex items-center space-x-3 p-2'>
              <Skeleton className='h-8 w-8 rounded-lg' />
              <div className='flex-1 space-y-1'>
                <Skeleton className='h-3 w-24 rounded' />
                <Skeleton className='h-2 w-32 rounded' />
              </div>
              <Skeleton className='h-4 w-4 rounded' />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebarLoading;
