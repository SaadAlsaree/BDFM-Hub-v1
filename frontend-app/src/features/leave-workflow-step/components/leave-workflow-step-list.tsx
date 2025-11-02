'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LeaveWorkflowStep,
  WorkflowStepStatus,
  WorkflowStepStatusDisplay,
  ActionTypeEnum,
  ActionTypeDisplay,
  RecipientTypeEnum,
  RecipientTypeDisplay
} from '../types/leave-workflow-step';
import { formatDate, getWorkflowStepStatusText } from '../utils/leave-workflow-step';
import { Calendar, User, Building, Clock, CheckCircle } from 'lucide-react';

interface LeaveWorkflowStepListProps {
  steps: LeaveWorkflowStep[];
  requestId?: string;
}

export default function LeaveWorkflowStepList({
  steps,
  requestId
}: LeaveWorkflowStepListProps) {
  if (!steps || steps.length === 0) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <p className='text-center text-gray-500'>لا توجد خطوات</p>
        </CardContent>
      </Card>
    );
  }

  const sortedSteps = [...steps].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold'>خطوات مسار العمل</h3>
      {sortedSteps.map((step, index) => (
        <Card key={step.id}>
          <CardHeader>
            <CardTitle className='flex items-center justify-between text-base'>
              <span className='flex items-center gap-2'>
                <span className='flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold'>
                  {index + 1}
                </span>
                <span>
                  {step.actionType
                    ? ActionTypeDisplay[step.actionType as ActionTypeEnum]
                    : '-'}
                </span>
              </span>
              <Badge
                variant={
                  step.status === WorkflowStepStatus.Completed
                    ? 'default'
                    : step.status === WorkflowStepStatus.InProgress
                      ? 'secondary'
                      : step.status === WorkflowStepStatus.Rejected
                        ? 'destructive'
                        : 'outline'
                }
              >
                {getWorkflowStepStatusText(step.status || 0)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div className='flex items-center gap-2 text-gray-600'>
                <User className='h-4 w-4' />
                <span>من:</span>
              </div>
              <div>
                {step.fromUserName || step.fromUnitName || '-'}
              </div>

              <div className='flex items-center gap-2 text-gray-600'>
                <Building className='h-4 w-4' />
                <span>إلى:</span>
              </div>
              <div>
                {step.toPrimaryRecipientName || '-'}
                {step.toPrimaryRecipientType && (
                  <Badge variant='outline' className='mr-2'>
                    {RecipientTypeDisplay[
                      step.toPrimaryRecipientType as RecipientTypeEnum
                    ]}
                  </Badge>
                )}
              </div>

              {step.dueDate && (
                <>
                  <div className='flex items-center gap-2 text-gray-600'>
                    <Clock className='h-4 w-4' />
                    <span>تاريخ الاستحقاق:</span>
                  </div>
                  <div>{formatDate(step.dueDate)}</div>
                </>
              )}

              {step.isTimeSensitive && (
                <>
                  <div className='flex items-center gap-2 text-gray-600'>
                    <Clock className='h-4 w-4 text-orange-600' />
                    <span>حساس للوقت:</span>
                  </div>
                  <Badge variant='destructive'>نعم</Badge>
                </>
              )}

              {step.activatedAt && (
                <>
                  <div className='flex items-center gap-2 text-gray-600'>
                    <CheckCircle className='h-4 w-4' />
                    <span>تاريخ التفعيل:</span>
                  </div>
                  <div>{formatDate(step.activatedAt)}</div>
                </>
              )}

              {step.completedAt && (
                <>
                  <div className='flex items-center gap-2 text-gray-600'>
                    <CheckCircle className='h-4 w-4 text-green-600' />
                    <span>تاريخ الإكمال:</span>
                  </div>
                  <div>{formatDate(step.completedAt)}</div>
                </>
              )}
            </div>

            {step.instructionText && (
              <div className='mt-3 rounded-lg bg-gray-50 p-3'>
                <p className='text-sm font-medium text-gray-700'>
                  نص التعليمات:
                </p>
                <p className='text-sm text-gray-600'>
                  {step.instructionText}
                </p>
              </div>
            )}

            {step.recipientActions && step.recipientActions.length > 0 && (
              <div className='mt-3 rounded-lg border p-3'>
                <p className='mb-2 text-sm font-medium'>سجل الإجراءات:</p>
                <div className='space-y-2'>
                  {step.recipientActions.map((action) => (
                    <div
                      key={action.id}
                      className='rounded bg-gray-50 p-2 text-xs'
                    >
                      <div className='flex justify-between'>
                        <span className='font-medium'>
                          {action.actionDescription}
                        </span>
                        <span>{formatDate(action.actionTimestamp)}</span>
                      </div>
                      {action.actionTakenByUserName && (
                        <div className='text-gray-600'>
                          بواسطة: {action.actionTakenByUserName}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className='mt-2 text-xs text-gray-500'>
              تاريخ الإنشاء: {formatDate(step.createAt)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

