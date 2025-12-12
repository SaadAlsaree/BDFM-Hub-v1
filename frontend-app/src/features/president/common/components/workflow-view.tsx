'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/animate-ui/radix/accordion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { WorkflowStep } from '@/features/correspondence/inbox-list/types/correspondence-details';
import { useCurrentUser } from '@/hooks/use-current-user';
import { cn } from '@/lib/utils';
import moment from 'moment';
import {
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Workflow,
  Activity,
  UserCheck,
  RotateCcw,
  Building2,
  Calendar,
  Check
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import WorkflowAction from './workflow-action';

// Status badge component
const StatusBadge = ({ status }: { status: number }) => {
  const variants = {
    1: {
      icon: Clock,
      className:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
      label: 'قيد الانتظار'
    },
    2: {
      icon: Activity,
      className:
        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
      label: 'قيد التنفيذ'
    },
    3: {
      icon: CheckCircle2,
      className:
        'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
      label: 'مكتمل'
    },
    4: {
      icon: XCircle,
      className:
        'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
      label: 'مرفوض'
    },
    5: {
      icon: UserCheck,
      className:
        'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
      label: 'مفوض'
    },
    6: {
      icon: RotateCcw,
      className:
        'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
      label: 'مُرجع'
    }
  };

  const variant = variants[status as keyof typeof variants] || variants[1];
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

interface Props {
  workflowSteps: WorkflowStep[];
}

const WorkflowView = (props: Props) => {
  const { user } = useCurrentUser();
  const { workflowSteps } = props;

  // Utility function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // filter workflow steps by user id or unit id
  const filteredWorkflowSteps = workflowSteps?.filter((step) => {
    return (
      step.toPrimaryRecipientId === user?.id ||
      step.toPrimaryRecipientId === user?.organizationalUnitId
    );
  });

  if (!filteredWorkflowSteps || filteredWorkflowSteps.length === 0) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center space-y-4 py-16'>
        <div className='rounded-full bg-gray-100 p-6 dark:bg-gray-800'>
          <Workflow className='h-12 w-12 text-gray-400' />
        </div>
        <div className='text-center'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
            لا توجد خطوات سير عمل
          </h3>
          <p className='text-gray-500 dark:text-gray-400'>
            لم يتم تحديد أي خطوات لسير العمل بعد
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-1 flex-col space-y-6'>
      {/* Header Section */}
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <h2 className='text-2xl font-bold tracking-tight'>سير العمل</h2>
          <p className='text-muted-foreground'>
            {filteredWorkflowSteps.length} خطوة سير عمل
          </p>
        </div>
      </div>

      {/* Workflow Steps List */}
      <div className='space-y-4'>
        {filteredWorkflowSteps.map((step, index) => {
          const isOverdue =
            step.dueDate &&
            moment(step.dueDate).isBefore(moment()) &&
            (step.status === 1 || step.status === 2);
          return (
            <Card
              key={step.id}
              className='@container/card w-full bg-zinc-100 dark:bg-zinc-900'
            >
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-3'>
                      <CardTitle className='line-clamp-1 text-lg font-semibold @[250px]/card:text-xl'>
                        {step.actionTypeName}
                      </CardTitle>
                      <Badge variant='outline' className='text-xs'>
                        التحويل {index + 1}
                      </Badge>
                    </div>
                    <CardDescription className='flex items-center gap-2'>
                      <StatusBadge status={step.status} />
                      {isOverdue && (
                        <Badge variant='destructive' className='animate-pulse'>
                          متأخر
                        </Badge>
                      )}
                    </CardDescription>
                  </div>

                  {/* Action Buttons */}
                  <WorkflowAction workflowStep={step} />
                </div>
              </CardHeader>

              <CardContent className='space-y-4'>
                {/* Actions */}
                {step.recipientActions && step.recipientActions.length > 0 && (
                  <Accordion
                    type='single'
                    collapsible
                    className='rounded-lg border bg-white p-2 shadow dark:bg-zinc-800'
                  >
                    <AccordionItem value={`actions-${step.id}`}>
                      <AccordionTrigger className='cursor-pointer text-sm font-semibold'>
                        <div className='flex items-center gap-2'>
                          <h1 className='text-primary text-xl font-bold'>
                            الإجراءات المتخذة:
                          </h1>
                          <Badge variant='outline' className='text-xs'>
                            {step.recipientActions.length} إجراء
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className='space-y-2'>
                          {step.recipientActions.map((action, actionIndex) => (
                            <Card
                              key={action.id}
                              className='border-l-primary border-l-4'
                            >
                              <CardContent className='p-4'>
                                <div className='space-y-2'>
                                  <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                      <Badge
                                        variant='secondary'
                                        className='text-xs'
                                      >
                                        #{actionIndex + 1}
                                      </Badge>
                                      <span className='text-sm font-medium'>
                                        {action.internalActionTypeEnumName}
                                      </span>
                                    </div>
                                    <span className='text-muted-foreground text-xs'>
                                      {moment(action.actionTimestamp).format(
                                        'YYYY-MM-DD HH:mm'
                                      )}
                                    </span>
                                  </div>

                                  <p className='text-muted-foreground text-sm'>
                                    {action.actionDescription}
                                  </p>

                                  <div className='text-muted-foreground flex items-center gap-2 text-xs'>
                                    <User className='h-3 w-3' />
                                    <span>{action.actionTakenByUserName}</span>
                                    <span>•</span>
                                    <span>{action.actionTakenByUnitName}</span>
                                  </div>

                                  {action.notes && (
                                    <div className='rounded-md bg-yellow-50 p-2 dark:bg-yellow-950/30'>
                                      <p className='text-xs text-yellow-800 dark:text-yellow-200'>
                                        <strong>ملاحظات:</strong> {action.notes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}

                {/* Secondary Recipients */}
                {step.secondaryRecipients &&
                  step.secondaryRecipients.length > 0 && (
                    <Accordion
                      type='single'
                      collapsible
                      className='rounded-lg border bg-white p-2 shadow dark:bg-zinc-800'
                    >
                      <AccordionItem value={`secondary-${step.id}`}>
                        <AccordionTrigger className='cursor-pointer text-sm font-semibold'>
                          <div className='flex items-center gap-2'>
                            <h1 className='text-primary text-sm font-semibold'>
                              تحويل داخلي
                            </h1>
                            <Badge variant='outline' className='text-xs'>
                              {step.secondaryRecipients.length} مستلم
                            </Badge>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent>
                          <div>
                            <Separator className='my-2' />
                            <div className='grid gap-2 @[400px]/card:grid-cols-2'>
                              {step.secondaryRecipients.map((recipient) => (
                                <div
                                  key={recipient.id}
                                  className='bg-secondary/30 border-l-primary flex items-center gap-2 rounded-md border-l-4 p-2'
                                >
                                  <User className='text-muted-foreground h-3 w-3' />
                                  <div className='min-w-0 flex-1'>
                                    <p className='truncate text-xs font-medium'>
                                      {recipient.recipientName}
                                    </p>
                                    <Badge
                                      variant='outline'
                                      className='mt-1 text-xs'
                                    >
                                      {recipient.purpose}
                                    </Badge>
                                    <h1 className='mt-4 text-xs'>
                                      {recipient.instructionText}
                                    </h1>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}

                {/* Instructions */}
                {step.instructionText && (
                  <div className='border-primary bg-primary/5 flex justify-between rounded-lg border-l-4 p-4'>
                    <div>
                      <h5 className='mb-2 text-sm font-semibold text-blue-900 dark:text-blue-300'>
                        الهامش :
                      </h5>
                      <p className='text-sm'>{step.instructionText}</p>
                    </div>

                    {/* Due Date */}
                    {step.dueDate && (
                      <div className='flex items-start gap-3 rounded-lg'>
                        <Calendar className='text-muted-foreground h-4 w-4' />
                        <div>
                          <p className='text-sm font-medium'>تاريخ الاستحقاق</p>
                          <p className='text-muted-foreground text-xs'>
                            {moment(step.dueDate).format('YYYY-MM-DD')}
                          </p>
                        </div>
                        {isOverdue && (
                          <Badge variant='destructive' className='mr-auto'>
                            متأخر {moment().diff(moment(step.dueDate), 'days')}{' '}
                            يوم
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* From/To Users */}
                <div className='grid grid-cols-1 gap-4 @md/card:grid-cols-2 @md/card:gap-2'>
                  {/* From User Card */}
                  <Card className='border-l-primary border-l-4'>
                    <CardContent className='p-2'>
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-10 w-10'>
                          <AvatarFallback className='bg-gradient-to-br from-blue-500 to-purple-600 text-white'>
                            {getInitials(step.fromUser?.username || 'مجهول')}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex-1 space-y-1'>
                          <div className='flex items-center gap-2'>
                            <h4 className='text-sm font-semibold text-blue-800 dark:text-blue-200'>
                              المرسل
                            </h4>
                            <Badge variant='outline' className='text-xs'>
                              من
                            </Badge>
                          </div>
                          <p className='text-sm font-medium'>
                            {step.fromUser?.username || 'غير محدد'}
                          </p>
                          <div className='text-muted-foreground flex items-center gap-1 text-xs'>
                            <Building2 className='h-3 w-3' />
                            {step.fromUnit?.unitName || 'وحدة غير محددة'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* To User Card */}
                  <Card className='border-l-primary border-l-4'>
                    <CardContent className='p-2'>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900'>
                          <User className='h-5 w-5 text-green-600 dark:text-green-400' />
                        </div>
                        <div className='flex-1 space-y-1'>
                          <div className='flex items-center gap-2'>
                            <h4 className='text-sm font-semibold text-green-600 dark:text-green-200'>
                              المستقبل
                            </h4>
                            <Badge variant='outline' className='text-xs'>
                              إلى
                            </Badge>
                          </div>
                          <p className='text-sm font-medium'>
                            {step.toPrimaryRecipientTypeName ||
                              'مستلم غير محدد'}
                          </p>
                          {step.toPrimaryRecipientName && (
                            <p className='text-xs text-green-600 dark:text-green-400'>
                              {step.toPrimaryRecipientName}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowView;
