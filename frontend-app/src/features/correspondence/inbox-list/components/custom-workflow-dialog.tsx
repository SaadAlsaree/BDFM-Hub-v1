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
import { useSearchCustomWorkflow } from '@/hooks/use-search-custom-workflow';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/spinner';
import { toast } from 'sonner';
import {
  WorkflowStepStatus,
  RecipientTypeEnum
} from '@/features/workflow-step/types/workflow-step';
import {
  CustomWorkflowList,
  CustomWorkflowTargetTypeEnum
} from '@/features/customWorkflow/types/customWorkflow';
import { useAuthApi } from '@/hooks/use-auth-api';
import { workflowStepService } from '@/features/workflow-step/api/workflow-step.service';
import { useRouter } from 'next/navigation';

type CustomWorkflowDialogProps = {
  correspondenceId: string;
  children: React.ReactNode;
};

const CustomWorkflowDialog = ({
  correspondenceId,
  children
}: CustomWorkflowDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cuPopoverOpenBool, setCuPopoverOpenBool] = useState(false);
  const [selectedWorkflowStep, setSelectedWorkflowStep] =
    useState<CustomWorkflowList | null>(null);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(
    null
  );
  const [customWorkflowSearchValue, setCustomWorkflowSearchValue] =
    useState('');
  const [debouncedCustomWorkflowSearch, setDebouncedCustomWorkflowSearch] =
    useState('');
  const router = useRouter();

  // Debounce user search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCustomWorkflowSearch(customWorkflowSearchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [customWorkflowSearchValue]);

  const {
    data,
    error,
    isLoading: isSearching
  } = useSearchCustomWorkflow({
    searchTerm: debouncedCustomWorkflowSearch
  });

  const items = (data?.data?.items ?? []) as CustomWorkflowList[];

  const handelCustomWorkflowSelect = (workflowId: string) => {
    const workflow = items.find((it) => it.id === workflowId) || null;
    setSelectedWorkflowStep(workflow);
    setSelectedWorkflowId(workflowId);
    setCuPopoverOpenBool(false);
  };

  const { authApiCall } = useAuthApi();

  const handelSubmit = async () => {
    // compute dueDate by adding offset days (if provided) to now
    const dayMs = 24 * 60 * 60 * 1000;
    const workflowStepsPayload = (selectedWorkflowStep?.steps ?? []).map(
      (step) => {
        const offsetDays = step.defaultDueDateOffsetDays ?? 1; // fallback to 1 day if not provided
        const dueDateIso = new Date(
          Date.now() + offsetDays * dayMs
        ).toISOString();

        // Map custom workflow target type to RecipientTypeEnum
        const toPrimaryRecipientType =
          step.targetType === CustomWorkflowTargetTypeEnum.SpecificUser
            ? RecipientTypeEnum.User
            : RecipientTypeEnum.Unit;

        return {
          actionType: step.actionType,
          toPrimaryRecipientType,
          toPrimaryRecipientId: step.targetIdentifier ?? '',
          instructionText: step.defaultInstructionText ?? '',
          dueDate: dueDateIso,
          status: WorkflowStepStatus.Pending,
          isTimeSensitive: false
        };
      }
    );

    const payload = {
      correspondenceId: correspondenceId,
      workflowSteps: workflowStepsPayload
    };

    try {
      setIsLoading(true);
      const result = await authApiCall(() =>
        workflowStepService.createBulkWorkflowSteps(payload)
      );
      if (result?.data) {
        toast.success('تم إنشاء سير العمل بنجاح');

        setSelectedWorkflowId(null);
        setSelectedWorkflowStep(null);
        setCustomWorkflowSearchValue('');
        setIsLoading(false);

        setIsOpen(false);
        router.refresh();
      } else {
        toast.error('حدث خطأ أثناء إنشاء سير العمل');
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء إنشاء سير العمل');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className='sm:max-w-[525px]' from='bottom'>
          <DialogHeader>
            <DialogTitle>إنشاء سير العمل</DialogTitle>
            <DialogDescription>
              قم بإنشاء سير العمل وإدخال تفاصيله
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
                  ? (items.find((it: any) => it.id === selectedWorkflowId)
                      ?.workflowName ?? 'اختر سير العمل')
                  : 'اختر سير العمل'}
                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[300px] p-0'>
              <Command>
                <CommandInput
                  placeholder='ابحث عن سير العمل...'
                  value={customWorkflowSearchValue}
                  onValueChange={(val) => setCustomWorkflowSearchValue(val)}
                />
                <CommandList>
                  <CommandEmpty>
                    {isSearching
                      ? 'جاري البحث...'
                      : error
                        ? 'حدث خطأ في البحث'
                        : items.length === 0
                          ? 'لا يوجد نتائج'
                          : ''}
                  </CommandEmpty>
                  <CommandGroup>
                    {items.map((wf: any) => (
                      <CommandItem
                        value={wf.workflowName}
                        key={wf.id}
                        onSelect={() => {
                          handelCustomWorkflowSelect(wf.id);
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

          {selectedWorkflowStep && (
            <div>
              <div className='mt-4 flex w-full flex-col justify-start space-x-2'>
                <h1>{selectedWorkflowStep?.workflowName}</h1>
                <h2 className='text-muted-foreground text-sm'>
                  {selectedWorkflowStep?.description}
                </h2>
              </div>

              <div className='mt-4 flex w-full flex-col justify-start space-x-2'>
                <h1>{selectedWorkflowStep?.triggeringUnitName}</h1>
                <h2 className='text-muted-foreground text-sm'>
                  {selectedWorkflowStep?.triggeringCorrespondenceTypeName}
                </h2>
              </div>
            </div>
          )}

          <Separator />
          <div className='mt-4 flex w-full justify-end gap-2 space-x-2'>
            <Button variant='outline' onClick={() => setIsOpen(false)}>
              إلغاء
            </Button>
            <Button
              disabled={!selectedWorkflowStep}
              onClick={() => {
                // Handle create workflow action here
                handelSubmit();
                setIsOpen(false);
              }}
            >
              إنشاء سير العمل
              {isLoading && <Spinner />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomWorkflowDialog;
