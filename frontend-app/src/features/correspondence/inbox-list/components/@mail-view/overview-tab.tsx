'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardAction
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CorrespondenceDetails } from '../../types/correspondence-details';
import moment from 'moment';
import { useCurrentUser } from '@/hooks/use-current-user';

// import { useMemo } from 'react';
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  User,
  Mail,
  Hash,
  FolderOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Watermark from '@uiw/react-watermark';

import TemplateView from '@/features/templates/templates/template-view';

interface OverviewTabProps {
  data: CorrespondenceDetails;
}

export function OverviewTab({ data }: OverviewTabProps) {
  const isPostponed = !!data.postponedUntil;
  const isDeleted = !!data.deletedAt;
  const isFinalized = !!data.finalizedAt;

  // Computed values
  // const workflowStatus = useMemo(() => {
  //   const activeSteps =
  //     data.workflowSteps?.filter((step) => step.status === 1) || [];
  //   const completedSteps =
  //     data.workflowSteps?.filter((step) => step.status === 2) || [];
  //   const totalSteps = data.workflowSteps?.length || 0;

  //   return {
  //     active: activeSteps.length,
  //     completed: completedSteps.length,
  //     total: totalSteps,
  //     progress: totalSteps > 0 ? (completedSteps.length / totalSteps) * 100 : 0
  //   };
  // }, [data.workflowSteps]);

  // Status indicator component
  const StatusBadge = ({
    type
  }: {
    type: 'postponed' | 'deleted' | 'finalized' | 'pending';
  }) => {
    const variants = {
      postponed: {
        icon: Clock,
        className:
          'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
        label: 'مؤجل'
      },
      deleted: {
        icon: Trash2,
        className:
          'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
        label: 'محذوف'
      },
      finalized: {
        icon: CheckCircle2,
        className:
          'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
        label: 'معتمد'
      },
      pending: {
        icon: AlertCircle,
        className:
          'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
        label: 'قيد المراجعة'
      }
    };

    const variant = variants[type];
    const Icon = variant.icon;

    return (
      <Badge
        variant='outline'
        className={cn(
          'flex items-center gap-1.5 px-3 py-1 text-xs font-medium',
          variant.className
        )}
      >
        <Icon className='h-3 w-3' />
        {variant.label}
      </Badge>
    );
  };

  // Get overall status
  const getOverallStatus = () => {
    if (isDeleted) return 'deleted';
    if (isPostponed) return 'postponed';
    if (isFinalized) return 'finalized';
    return 'pending';
  };

  const { user } = useCurrentUser();

  return (
    <div className='flex flex-1 flex-col space-y-6'>
      {/* Header Section */}
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          {/* <h2 className='text-2xl font-bold tracking-tight'>
            {data.subject || 'بدون موضوع'}
          </h2> */}
          <p className='text-muted-foreground'>
            {data.correspondenceTypeName || 'نوع المراسلة غير محدد'}
          </p>
        </div>
        <StatusBadge type={getOverallStatus()} />
      </div>

      {/* Stats Cards Grid */}
      <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-3 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @3xl/main:grid-cols-4'>
        {/* Basic Info Card */}
        <div className='col-span-2'>
          <Watermark
            content={[user?.fullName || '', user?.userLogin || '']}
            fontSize={12}
            style={{ background: '#fff' }}
          >
            <TemplateView formData={data} unitName={data.externalEntityName} />
          </Watermark>
        </div>
        <div className='@container/card col-span-1 gap-4 space-y-4'>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription className='flex items-center gap-2'>
                <FileText className='h-4 w-4' />
                المعلومات الأساسية
              </CardDescription>
              <CardTitle className='line-clamp-1 text-lg font-semibold @[250px]/card:text-xl'>
                {data.subject || 'بدون موضوع'}
              </CardTitle>
              <CardAction>
                <Badge variant='outline' className='font-mono text-xs'>
                  <Hash className='ml-1 h-3 w-3' />
                  {data.mailNum || 'غير محدد'}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                <Mail className='size-4' />
                {data.correspondenceTypeName || 'نوع غير محدد'}
              </div>
              <div className='text-muted-foreground line-clamp-1'>
                {data.mailFileSubject || 'بدون موضوع ملف'}
              </div>
            </CardFooter>
          </Card>

          {/* File Info Card */}
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription className='flex items-center gap-2'>
                <FolderOpen className='h-4 w-4' />
                معلومات الاضبارة
              </CardDescription>
              <CardTitle className='text-lg font-semibold tabular-nums @[250px]/card:text-xl'>
                {data.mailFileNumber || 'غير محدد'}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <FileText className='ml-1 h-3 w-3' />
                  اضبارة
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                رقم الاضبارة
              </div>
              <div className='text-muted-foreground line-clamp-1'>
                {data.mailFileSubject || 'بدون موضوع'}
              </div>
            </CardFooter>
          </Card>

          {/* Creation Info Card */}
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                تاريخ الإنشاء
              </CardDescription>
              <CardTitle className='text-lg font-semibold tabular-nums @[250px]/card:text-xl'>
                {moment(data.createdAt).format('DD/MM/YYYY')}
              </CardTitle>
              <CardAction>
                <Badge variant='outline' className='font-mono text-xs'>
                  {moment(data.createdAt).format('HH:mm')}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                <User className='size-4' />
                {data.createdByUserName || 'مستخدم غير معروف'}
              </div>
              <div className='text-muted-foreground'>منشئ الكتاب</div>
            </CardFooter>
          </Card>
        </div>

        {/* Workflow Progress Card */}

        {data.workflowSteps && data.workflowSteps.length > 0 && (
          // <Card className='@container/card col-span-3'>
          //   <CardHeader>
          //     <CardDescription className='flex items-center gap-2'>
          //       <Workflow className='h-4 w-4' />
          //       تقدم سير العمل
          //     </CardDescription>
          //     <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
          //       {Math.round(workflowStatus.progress)}%
          //     </CardTitle>
          //     <CardAction>
          //       <Badge
          //         variant='outline'
          //         className={cn(
          //           workflowStatus.progress === 100
          //             ? 'border-green-200 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
          //             : workflowStatus.progress > 0
          //               ? 'border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
          //               : 'border-gray-200 bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300'
          //         )}
          //       >
          //         {workflowStatus.progress === 100 ? (
          //           <CheckCircle2 className='ml-1 h-3 w-3' />
          //         ) : (
          //           <Clock className='ml-1 h-3 w-3' />
          //         )}
          //         {workflowStatus.completed}/{workflowStatus.total}
          //       </Badge>
          //     </CardAction>
          //   </CardHeader>
          //   <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          //     <div className='line-clamp-1 flex gap-2 font-medium'>
          //       {workflowStatus.progress === 100 ? (
          //         <>
          //           <CheckCircle2 className='size-4 text-green-600' />
          //           سير العمل مكتمل
          //         </>
          //       ) : workflowStatus.active > 0 ? (
          //         <>
          //           <Clock className='size-4 text-blue-600' />
          //           {workflowStatus.active} خطوة نشطة
          //         </>
          //       ) : (
          //         <>
          //           <AlertCircle className='size-4 text-gray-600' />
          //           لم يبدأ بعد
          //         </>
          //       )}
          //     </div>
          //     <div className='text-muted-foreground'>
          //       {workflowStatus.completed} من {workflowStatus.total} خطوات
          //       مكتملة
          //     </div>
          //   </CardFooter>
          // </Card>
          <div>
            <h1></h1>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
