'use client';

import { useEffect, useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/spinner';
import { toast } from 'sonner';
import {
  WorkflowStepStatus,
  RecipientTypeEnum
} from '@/features/leave-workflow-step/types/leave-workflow-step';
import { LeaveWorkflow } from '@/features/leave-workflow/types/leave-workflow';
import { useAuthApi } from '@/hooks/use-auth-api';
import { leaveWorkflowService } from '@/features/leave-workflow/api/leave-workflow.service';
import { leaveWorkflowStepService } from '@/features/leave-workflow-step/api/leave-workflow-step.service';
import { useRouter } from 'next/navigation';
import { LeaveWorkflowStepTemplate } from '@/features/leave-workflow-step-template/types/leave-workflow-step-template';
import { leaveWorkflowStepTemplateService } from '@/features/leave-workflow-step-template/api/leave-workflow-step-template.service';
import {
  CustomWorkflowTargetTypeEnum,
  CustomWorkflowTargetTypeDisplay
} from '@/features/leave-workflow-step-template/types/leave-workflow-step-template';

type LeaveWorkflowDialogProps = {
  leaveRequestId: string;
  children: React.ReactNode;
};

const LeaveWorkflowDialog = ({
  leaveRequestId,
  children
}: LeaveWorkflowDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(false);
  const [cuPopoverOpenBool, setCuPopoverOpenBool] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<LeaveWorkflow | null>(null);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [workflowSearchValue, setWorkflowSearchValue] = useState('');
  const [debouncedWorkflowSearch, setDebouncedWorkflowSearch] = useState('');
  const [workflowTemplates, setWorkflowTemplates] = useState<LeaveWorkflowStepTemplate[]>([]);
  const router = useRouter();

  // Debounce workflow search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedWorkflowSearch(workflowSearchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [workflowSearchValue]);

  // Fetch workflows
  const { authApiCall } = useAuthApi();
  const [workflows, setWorkflows] = useState<LeaveWorkflow[]>([]);

  useEffect(() => {
    async function fetchWorkflows() {
      setIsLoadingWorkflow(true);
      try {
        const response = await authApiCall(() =>
          leaveWorkflowService.getLeaveWorkflowList({
            searchText: debouncedWorkflowSearch || undefined,
            isEnabled: true
          })
        );
        if (response?.data?.items) {
          setWorkflows((response.data.items as LeaveWorkflow[]) || []);
        }
      } catch (error) {
        console.error('Error fetching workflows:', error);
      } finally {
        setIsLoadingWorkflow(false);
      }
    }

    if (isOpen) {
      fetchWorkflows();
    }
  }, [debouncedWorkflowSearch, isOpen, authApiCall]);

  // Fetch workflow templates when workflow is selected
  useEffect(() => {
    async function fetchWorkflowTemplates() {
      if (!selectedWorkflowId) {
        setWorkflowTemplates([]);
        return;
      }

      setIsLoadingWorkflow(true);
      try {
        const response = await authApiCall(() =>
          leaveWorkflowStepTemplateService.getLeaveWorkflowStepTemplatesByWorkflowId(
            selectedWorkflowId
          )
        );
        if (response?.data) {
          setWorkflowTemplates((response.data as LeaveWorkflowStepTemplate[]) || []);
        }
      } catch (error) {
        console.error('Error fetching workflow templates:', error);
      } finally {
        setIsLoadingWorkflow(false);
      }
    }

    if (selectedWorkflowId) {
      fetchWorkflowTemplates();
    }
  }, [selectedWorkflowId, authApiCall]);

  const handleWorkflowSelect = (workflowId: string) => {
    const workflow = workflows.find((it) => it.id === workflowId) || null;
    setSelectedWorkflow(workflow);
    setSelectedWorkflowId(workflowId);
    setCuPopoverOpenBool(false);
  };

  const handleSubmit = async () => {
    if (!selectedWorkflow || !leaveRequestId) {
      toast.error('يرجى اختيار مسار عمل');
      return;
    }

    // Create workflow steps from templates
    const dayMs = 24 * 60 * 60 * 1000;
    
    try {
      setIsLoading(true);
      
      // Create each step from template
      for (const template of workflowTemplates.filter(t => t.isActive)) {
        const offsetDays = template.defaultDueDateOffsetDays ?? 1;
        const dueDateIso = new Date(Date.now() + offsetDays * dayMs).toISOString();

        // Map template target type to RecipientTypeEnum
        let toPrimaryRecipientType = RecipientTypeEnum.User;
        if (template.targetType === CustomWorkflowTargetTypeEnum.SpecificUnit) {
          toPrimaryRecipientType = RecipientTypeEnum.Unit;
        }

        const stepPayload = {
          leaveRequestId: leaveRequestId,
          actionType: template.actionType || 1,
          toPrimaryRecipientType: toPrimaryRecipientType,
          toPrimaryRecipientId: template.targetIdentifier || '',
          instructionText: template.defaultInstructionText || '',
          dueDate: dueDateIso,
          status: WorkflowStepStatus.Pending,
          isTimeSensitive: false
        };

        const result = await authApiCall(() =>
          leaveWorkflowStepService.createLeaveWorkflowStep(stepPayload)
        );

        if (!result?.data) {
          toast.error('حدث خطأ أثناء إنشاء خطوات مسار العمل');
          setIsLoading(false);
          return;
        }
      }

      toast.success('تم إنشاء مسار العمل بنجاح');
      setSelectedWorkflowId(null);
      setSelectedWorkflow(null);
      setWorkflowSearchValue('');
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      toast.error('حدث خطأ أثناء إنشاء مسار العمل');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[525px]' from='bottom'>
        <DialogHeader>
          <DialogTitle>إنشاء مسار عمل</DialogTitle>
          <DialogDescription>
            قم باختيار مسار العمل لإنشاء خطوات مسار العمل للطلب
          </DialogDescription>
        </DialogHeader>

        <Separator />
        <Popover
          open={cuPopoverOpenBool}
          onOpenChange={(open) => setCuPopoverOpenBool(Boolean(open))}
        >
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              role='combobox'
              className={cn('w-full justify-between')}
            >
              {selectedWorkflowId
                ? (workflows.find((it: any) => it.id === selectedWorkflowId)
                    ?.workflowName ?? 'اختر مسار العمل')
                : 'اختر مسار العمل'}
              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-[300px] p-0'>
            <Command>
              <CommandInput
                placeholder='ابحث عن مسار عمل...'
                value={workflowSearchValue}
                onValueChange={(val) => setWorkflowSearchValue(val)}
              />
              <CommandList>
                <CommandEmpty>
                  {isLoadingWorkflow
                    ? 'جاري البحث...'
                    : workflows.length === 0
                      ? 'لا يوجد نتائج'
                      : ''}
                </CommandEmpty>
                <CommandGroup>
                  {workflows.map((wf: any) => (
                    <CommandItem
                      value={wf.workflowName}
                      key={wf.id}
                      onSelect={() => {
                        handleWorkflowSelect(wf.id);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          wf.id === selectedWorkflowId
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      <div className='flex flex-col'>
                        <h1 className='text-sm font-medium'>
                          {wf.workflowName}
                        </h1>
                        <p className='text-muted-foreground text-xs'>
                          {wf.description}
                        </p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Separator />

        {selectedWorkflow && (
          <div className='space-y-6'>
            {/* Workflow Information Card */}
            <div className='bg-card rounded-lg border p-4 shadow-sm'>
              <div className='space-y-3'>
                <div className='flex items-start justify-between'>
                  <div className='space-y-1'>
                    <h3 className='text-lg leading-none font-semibold tracking-tight'>
                      {selectedWorkflow.workflowName}
                    </h3>
                    <p className='text-muted-foreground text-sm'>
                      {selectedWorkflow.description}
                    </p>
                  </div>
                  {selectedWorkflow.isEnabled && (
                    <div className='bg-primary/10 rounded-full px-2 py-1'>
                      <span className='text-primary text-xs font-medium'>
                        نشط
                      </span>
                    </div>
                  )}
                </div>

                <div className='flex items-center gap-4 pt-2'>
                  <div className='flex items-center gap-2 text-sm'>
                    <div className='h-2 w-2 rounded-full bg-blue-500'></div>
                    <span className='text-muted-foreground'>الوحدة:</span>
                    <span className='font-medium'>
                      {selectedWorkflow.triggeringUnitName}
                    </span>
                  </div>
                  <div className='flex items-center gap-2 text-sm'>
                    <div className='h-2 w-2 rounded-full bg-green-500'></div>
                    <span className='text-muted-foreground'>النوع:</span>
                    <span className='font-medium'>
                      {selectedWorkflow.triggeringLeaveTypeName}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Workflow Steps Section */}
            {isLoadingWorkflow ? (
              <div className='flex items-center justify-center p-8'>
                <Spinner />
              </div>
            ) : (
              <ScrollArea className='h-72 w-full'>
                <div className='space-y-3 px-4'>
                  <div className='flex items-center gap-2'>
                    <h4 className='text-sm font-semibold'>خطوات مسار العمل</h4>
                    <div className='bg-border h-px flex-1'></div>
                    <span className='text-muted-foreground text-xs'>
                      {workflowTemplates.filter(t => t.isActive).length} خطوات
                    </span>
                  </div>

                  <div className='space-y-3'>
                    {workflowTemplates
                      .filter((template) => template.isActive)
                      .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
                      .map((step, index) => (
                        <div
                          key={step.id || index}
                          className='bg-card/50 hover:bg-card relative rounded-lg border p-4 transition-colors'
                        >
                          {/* Step Number */}
                          <div className='bg-primary text-primary-foreground absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold'>
                            {index + 1}
                          </div>

                          <div className='space-y-2 pl-6'>
                            <div className='flex items-center justify-between'>
                              <h5 className='leading-tight font-medium'>
                                {step.actionTypeName}
                              </h5>
                              <div className='flex items-center gap-2'>
                                {step.targetType && (
                                  <div className='flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'>
                                    <div className='h-1.5 w-1.5 rounded-full bg-blue-500'></div>
                                    {CustomWorkflowTargetTypeDisplay[step.targetType as CustomWorkflowTargetTypeEnum] || 'غير محدد'}
                                  </div>
                                )}
                              </div>
                            </div>

                            {step.defaultInstructionText && (
                              <p className='text-muted-foreground text-sm'>
                                {step.defaultInstructionText}
                              </p>
                            )}

                            <div className='text-muted-foreground flex items-center gap-4 text-xs'>
                              <span>
                                إلى: {step.targetIdentifierName || 'غير محدد'}
                              </span>
                              {step.defaultDueDateOffsetDays !== undefined && (
                                <span className='flex items-center gap-1'>
                                  <div className='h-1 w-1 rounded-full bg-orange-400'></div>
                                  موعد نهائي: {step.defaultDueDateOffsetDays} أيام
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Connection Line */}
                          {index <
                            workflowTemplates.filter((t) => t.isActive).length - 1 && (
                            <div className='bg-border absolute -bottom-3 left-1 h-6 w-px'></div>
                          )}
                        </div>
                      )) || (
                      <div className='rounded-lg border border-dashed p-8 text-center'>
                        <p className='text-muted-foreground text-sm'>
                          لا توجد خطوات محددة لهذا مسار العمل
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        <Separator />
        <div className='mt-4 flex w-full justify-end gap-2 space-x-2'>
          <Button variant='outline' onClick={() => setIsOpen(false)}>
            إلغاء
          </Button>
          <Button
            disabled={!selectedWorkflow || isLoading}
            onClick={handleSubmit}
          >
            إنشاء مسار العمل
            {isLoading && <Spinner className='ml-2' />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveWorkflowDialog;

