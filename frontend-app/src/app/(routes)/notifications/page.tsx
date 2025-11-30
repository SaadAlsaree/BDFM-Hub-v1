'use client';

import React, { useState } from 'react';
import { Search, Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from '@/features/notifications/components/NotificationItem';
import { NotificationEmpty } from '@/features/notifications/components/NotificationEmpty';
import { NotificationSkeleton } from '@/features/notifications/components/NotificationSkeleton';
import { NotificationType } from '@/types/notifications';
import { DataTablePagination } from '@/components/ui/table/data-table-pagination';

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Build query from filters
  const query = {
    page: currentPage,
    pageSize,
    ...(selectedStatus !== 'all' && { isRead: selectedStatus === 'read' }),
    ...(selectedType !== 'all' && {
      notificationType: parseInt(selectedType) as NotificationType
    })
  };

  const {
    notifications,
    totalCount,
    unreadCount,
    loading,
    error,
    isConnected,
    isSignalRAvailable,
    connectionState,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    retrySignalRConnection,
    isMarkingAllAsRead
  } = useNotifications(query, { skipGlobalListeners: true });

  // Filter notifications by search term (client-side)
  const filteredNotifications = notifications.filter(
    (notification) =>
      searchTerm === '' ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.correspondenceSubject
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const handleRefresh = async () => {
    try {
      await refreshNotifications();
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleRetryConnection = async () => {
    try {
      await retrySignalRConnection();
    } catch (error) {
      console.error('Failed to retry connection:', error);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  // Get connection status info
  const getConnectionStatusInfo = () => {
    if (!isSignalRAvailable) {
      return {
        color: 'bg-gray-500',
        text: 'غير متاح',
        icon: WifiOff,
        description: 'SignalR غير متاح - يتم استخدام التحديث اليدوي'
      };
    }

    if (isConnected) {
      return {
        color: 'bg-green-500',
        text: 'متصل',
        icon: Wifi,
        description: 'متصل مع التحديثات الفورية'
      };
    }

    if (connectionState.isConnecting) {
      return {
        color: 'bg-yellow-500',
        text: 'جاري الاتصال',
        icon: RefreshCw,
        description: 'جاري محاولة الاتصال...'
      };
    }

    return {
      color: 'bg-red-500',
      text: 'غير متصل',
      icon: WifiOff,
      description: connectionState.error || 'فشل في الاتصال'
    };
  };

  const connectionInfo = getConnectionStatusInfo();
  const ConnectionIcon = connectionInfo.icon;

  return (
    <div className='container mx-auto space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>الإشعارات</h1>
          <p className='text-muted-foreground'>إدارة الإشعارات والتحديثات</p>
        </div>

        <div className='flex items-center gap-4'>
          {/* Connection Status */}
          <div className='flex items-center gap-2 text-sm'>
            <div className={`h-2 w-2 rounded-full ${connectionInfo.color}`} />
            <ConnectionIcon
              className={`h-4 w-4 ${connectionInfo.icon === RefreshCw ? 'animate-spin' : ''}`}
            />
            <span className='text-gray-600'>{connectionInfo.text}</span>
          </div>

          <Button
            onClick={handleRefresh}
            variant='outline'
            disabled={loading}
            className='flex items-center gap-2'
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllAsRead}
              className='flex items-center gap-2'
            >
              {isMarkingAllAsRead && (
                <RefreshCw className='h-4 w-4 animate-spin' />
              )}
              تحديد الكل كمقروء ({unreadCount})
            </Button>
          )}
        </div>
      </div>

      {/* Connection Alert */}
      {connectionState.error && !isConnected && (
        <Alert>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription className='flex items-center justify-between'>
            <span>مشكلة في الاتصال: {connectionState.error}</span>
            {isSignalRAvailable && (
              <Button
                onClick={handleRetryConnection}
                size='sm'
                variant='outline'
                className='ml-2'
              >
                إعادة المحاولة
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              إجمالي الإشعارات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>غير مقروءة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {unreadCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>مقروءة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {totalCount - unreadCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>حالة الاتصال</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-2'>
              <Badge variant={isConnected ? 'default' : 'secondary'}>
                {connectionInfo.text}
              </Badge>
            </div>
            <p className='text-muted-foreground mt-1 text-xs'>
              {connectionInfo.description}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4'>
            {/* Search */}
            <div className='flex-1'>
              <div className='relative'>
                <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                <Input
                  placeholder='البحث في الإشعارات...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            {/* Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='نوع الإشعار' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>جميع الأنواع</SelectItem>
                <SelectItem value={NotificationType.NewMail.toString()}>
                  بريد جديد
                </SelectItem>
                <SelectItem value={NotificationType.StatusUpdate.toString()}>
                  تحديث الحالة
                </SelectItem>
                <SelectItem
                  value={NotificationType.WorkflowAssignment.toString()}
                >
                  مهمة سير العمل
                </SelectItem>
                <SelectItem value={NotificationType.SystemAlert.toString()}>
                  تنبيه النظام
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='الحالة' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>جميع الحالات</SelectItem>
                <SelectItem value='unread'>غير مقروءة</SelectItem>
                <SelectItem value='read'>مقروءة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardContent className='p-0'>
          <ScrollArea className='h-[340px]'>
            <div className='space-y-4 p-6'>
              {loading ? (
                <div className='space-y-4'>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <NotificationSkeleton key={i} />
                  ))}
                </div>
              ) : error ? (
                <div className='p-8 text-center'>
                  <AlertCircle className='mx-auto mb-4 h-12 w-12 text-red-500' />
                  <p className='text-muted-foreground mb-4'>
                    فشل في تحميل الإشعارات
                  </p>
                  <p className='mb-4 text-sm text-red-500'>{error}</p>
                  <div className='space-y-2'>
                    <Button onClick={handleRefresh} variant='outline'>
                      إعادة المحاولة
                    </Button>
                    {!isConnected && isSignalRAvailable && (
                      <Button
                        onClick={handleRetryConnection}
                        variant='outline'
                        size='sm'
                      >
                        إعادة الاتصال
                      </Button>
                    )}
                  </div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <NotificationEmpty onRefresh={handleRefresh} />
              ) : (
                <>
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                    />
                  ))}
                </>
              )}
            </div>
          </ScrollArea>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='border-t p-4'>
              <DataTablePagination
                table={
                  {
                    getPageCount: () => totalPages,
                    getCanPreviousPage: () => currentPage > 1,
                    getCanNextPage: () => currentPage < totalPages,
                    previousPage: () =>
                      setCurrentPage((prev) => Math.max(1, prev - 1)),
                    nextPage: () =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1)),
                    setPageIndex: (index: number) => setCurrentPage(index + 1),
                    getState: () => ({
                      pagination: { pageIndex: currentPage - 1, pageSize }
                    }),
                    setPageSize: () => {},
                    getRowCount: () => totalCount,
                    getFilteredRowModel: () => ({
                      rows: Array(totalCount).fill(null)
                    }),
                    getFilteredSelectedRowModel: () => ({
                      rows: []
                    }),
                    getRowModel: () => ({
                      rows: Array(pageSize).fill(null)
                    })
                  } as any
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
