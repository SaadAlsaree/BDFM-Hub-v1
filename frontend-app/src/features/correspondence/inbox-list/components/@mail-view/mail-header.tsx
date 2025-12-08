'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  CorrespondenceDetails,
  CorrespondenceStatusEnum
} from '../../types/correspondence-details';
import { WorkflowStepFormDialog } from '@/features/workflow-step/components/workflow-step-form-dialog';
import moment from 'moment';
import {
  Star,
  Clock,
  AlertCircle,
  Building,
  User,
  Flag,
  Eye,
  Trash2,
  Printer
} from 'lucide-react';
import MailStatusDialog from '../mail-status-dialog';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/use-current-user';
import { hasAnyPermission } from '@/utils/auth/auth-utils';
import { UserDto } from '@/utils/auth/auth';
import { Spinner } from '@/components/spinner';
import { CorrespondenceTypeEnum } from '@/features/correspondence/types/register-incoming-external-mail';
import CustomWorkflowDialog from '../custom-workflow-dialog';

interface MailHeaderProps {
  data: CorrespondenceDetails;
  loading: boolean;
  isStarred: boolean;
  isPostponed: boolean;
  isTrashed: boolean;
  isOverdue: boolean;
  onToggleStar: () => void;
  onIsTrashed: () => void;
  // onWorkflowStepSubmit: (data: WorkflowStepInputFormData) => void;
  getPriorityBadgeVariant: (
    level: number | undefined
  ) => 'default' | 'destructive' | 'outline' | 'secondary' | undefined;
  getSecrecyBadgeVariant: (
    level: number | undefined
  ) => 'default' | 'destructive' | 'outline' | 'secondary' | undefined;
}

export function MailHeader({
  data,
  loading,
  isStarred,
  isPostponed,
  isTrashed,
  isOverdue,
  onToggleStar,
  onIsTrashed,
  // onWorkflowStepSubmit,
  getPriorityBadgeVariant,
  getSecrecyBadgeVariant
}: MailHeaderProps) {
  const { user, isLoading } = useCurrentUser();

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-start justify-between'>
        <div className='space-y-1'>
          <Heading
            title={data.subject || 'الكتاب'}
            description={`رقم الكتاب: ${data.mailNum || 'غير محدد'} | تاريخ الإنشاء: ${moment(data.createdAt).format('YYYY-MM-DD')}`}
          />
          <div className='flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300'>
            <Building className='h-4 w-4' />
            <span>{data.externalEntityName || ''}</span>
            {data.createdByUserName && (
              <>
                <Separator orientation='vertical' className='h-4' />
                <User className='h-4 w-4' />
                <span className='space-y-4'>
                  منشئ بواسطة: {data.createdByUserName}
                </span>
                <span className=''>
                  {data.createdByUnitName || 'وحدة غير معروفة'} -
                  {data.createdByUnitCode || 'رمز الوحدة غير معروف'}
                </span>
              </>
            )}
          </div>
        </div>

        <div className='flex gap-1'>
          {isLoading && (
            <div className='flex items-center justify-center'>
              <Spinner className='text-primary animate-spin' />
            </div>
          )}



          {(user?.id === data.createdByUserId ||
            hasAnyPermission(user as UserDto | null, [
              'Correspondence|WorkflowStep'
            ])) &&
            data.workflowSteps?.length === 0 &&
            data.correspondenceType !== 0 && (
              <CustomWorkflowDialog correspondenceId={data.id}>
                <Button variant='default'  size='sm'>إنشاء سير العمل مخصص</Button>
              </CustomWorkflowDialog>
            )}
          {(user?.organizationalUnit.unitCode === data.createdByUnitCode &&
      (
            <div>
              <MailStatusDialog
                correspondenceId={data.id}
                currentStatus={
                  data.correspondenceStatus as CorrespondenceStatusEnum
                }
                correspondenceType={
                  data.correspondenceType as CorrespondenceTypeEnum
                }
              >
                <Button variant='outline'  size='sm'>تحديث الحالة</Button>
              </MailStatusDialog>
            </div>
          ))}
          <div>
            {(user?.id === data.createdByUserId ||
              hasAnyPermission(user as UserDto | null, [
                'Correspondence|WorkflowStep'
              ])) &&
              data.correspondenceType !== 0 && (
                <WorkflowStepFormDialog correspondenceId={data.id} />
              )}
          </div>
          <Tooltip>
          <TooltipTrigger asChild>
          <Button
            variant={isStarred ? 'default' : 'outline'}
            size='sm'
            onClick={onToggleStar}
            disabled={loading}
          >
            <Star
              className={`h-4 w-4 ${
                isStarred
                  ? 'fill-current text-yellow-500'
                  : 'text-zinc-500 hover:text-yellow-500 dark:text-zinc-400'
              }`}
            />
           
          </Button>
          </TooltipTrigger>
          <TooltipContent>
          <p>{isStarred ? 'الكتاب متابع' : 'متابعة الكتاب'}</p>
          </TooltipContent>
          </Tooltip>
          {data.isDraft && (
            
            <Button
              variant='outline'
              size='sm'
              onClick={onIsTrashed}
              disabled={loading}
            >
              <Trash2
                className={`ml-2 h-4 w-4 ${
                  isTrashed ? 'text-red-500' : 'text-gray-500'
                }`}
              />
              {isTrashed ? 'إرجاع الكتاب' : 'نقل الكتابة إلى المهملات'}
            </Button>
          )}
          <div>
            {hasAnyPermission(user as UserDto | null, [
              'Correspondence|Print'
            ]) && (
              <Link href={`/correspondence/view/${data.id}/templates`}>
                 <Tooltip>
                 <TooltipTrigger asChild>
                <Button variant='outline' size='sm'>
                    <Printer className='h-4 w-4' />
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                    <p>طباعة</p>
                    </TooltipContent>
                    </Tooltip>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className='flex flex-wrap items-center gap-3 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900'>
        <div className='flex items-center gap-2'>
          <AlertCircle className='h-4 w-4 text-gray-500' />
          <Badge variant='outline'>{data.statusName || 'غير محدد'}</Badge>
        </div>

        <Separator orientation='vertical' className='h-6' />

        <div className='flex items-center gap-2'>
          <Flag className='h-4 w-4 text-gray-500' />
          <Badge variant={getPriorityBadgeVariant(data.priorityLevel)}>
            {data.priorityLevelName || 'غير محدد'}
          </Badge>
        </div>

        <Separator orientation='vertical' className='h-6' />

        <div className='flex items-center gap-2'>
          <Eye className='h-4 w-4 text-gray-500' />
          <Badge variant={getSecrecyBadgeVariant(data.secrecyLevel)}>
            {data.secrecyLevelName || 'عام'}
          </Badge>
        </div>

        {isOverdue && (
          <>
            <Separator orientation='vertical' className='h-6' />
            <div className='flex items-center gap-2 text-red-600'>
              <AlertCircle className='h-4 w-4' />
              <span className='text-sm font-medium'>متأخر</span>
            </div>
          </>
        )}

        {isStarred && (
          <>
            <Separator orientation='vertical' className='h-6' />
            <div className='flex items-center gap-2 text-yellow-600'>
              <Star className='h-4 w-4 fill-current' />
              <span className='text-sm font-medium'>مميز</span>
            </div>
          </>
        )}

        {isPostponed && (
          <>
            <Separator orientation='vertical' className='h-6' />
            <div className='flex items-center gap-2 text-orange-600'>
              <Clock className='h-4 w-4' />
              <span className='text-sm font-medium'>مؤجل</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
