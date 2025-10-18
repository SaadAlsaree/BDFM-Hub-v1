'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CorrespondenceDetails } from '@/features/correspondence/inbox-list/types/correspondence-details';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/animate-ui/radix/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import moment from 'moment';
import { useState, useMemo, useEffect } from 'react';
import { FileText, MessageCircle, Link, Workflow } from 'lucide-react';
import { toast } from 'sonner';
import { correspondenceService } from '../../api/correspondence.service';
import { useAuthApi } from '@/hooks/use-auth-api';
import { LogRecipientInternalActionInputFormData } from '@/features/workflow-step/utils/workflow-step';
import { workflowStepService } from '@/features/workflow-step/api/workflow-step.service';
import {
  OverviewTab,
  WorkflowTab,
  ReferencesTab,
  CommentsTab,
  AttachmentsTab,
  MailHeader
} from './@mail-view';

interface Props {
  data: CorrespondenceDetails;
}

export default function MailViewPage({ data }: Props) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [localIsStarred, setLocalIsStarred] = useState(
    data.userCorrespondenceInteraction?.isStarred || false
  );
  const [localIsTrashed, setLocalIsTrashed] = useState(
    data.userCorrespondenceInteraction?.isInTrash || false
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  const { authApiCall } = useAuthApi();

  // Use local state for starred status
  const isStarred = localIsStarred;
  const isPostponed = !!data.postponedUntil;
  const isTrashed = localIsTrashed;

  if (data.userCorrespondenceInteraction?.correspondenceId != data.id) {
    authApiCall(async () => await correspondenceService.isRead(true, data.id!));
  }

  // Sync local state with prop changes
  useEffect(() => {
    setLocalIsStarred(data.userCorrespondenceInteraction?.isStarred || false);
  }, [data.userCorrespondenceInteraction?.isStarred]);

  useEffect(() => {
    setLocalIsTrashed(data.userCorrespondenceInteraction?.isInTrash || false);
  }, [data.userCorrespondenceInteraction?.isInTrash]);

  const isRead = data?.userCorrespondenceInteraction?.isRead;

  // TODO: Implement isRead
  const readMailByUserHandler = async () => {
    if (isRead === false) {
      await authApiCall(() => correspondenceService.isRead(true, data.id!));
    }
  };

  useEffect(() => {
    readMailByUserHandler();
  }, []);

  // Computed values
  const isOverdue = useMemo(() => {
    const latestWorkflowStep = data.workflowSteps
      ?.filter((step) => step.dueDate && (step.status == 1 || step.status == 2))
      ?.sort((a, b) => moment(b.dueDate).unix() - moment(a.dueDate).unix())[0];

    return !!(
      latestWorkflowStep?.dueDate &&
      moment(latestWorkflowStep.dueDate).isBefore(moment())
    );
  }, [data.workflowSteps]);

  const workflowStatus = useMemo(() => {
    const activeSteps =
      data.workflowSteps?.filter((step) => step.status === 1) || [];
    const completedSteps =
      data.workflowSteps?.filter((step) => step.status === 2) || [];
    const totalSteps = data.workflowSteps?.length || 0;

    return {
      active: activeSteps.length,
      completed: completedSteps.length,
      total: totalSteps,
      progress: totalSteps > 0 ? (completedSteps.length / totalSteps) * 100 : 0
    };
  }, [data.workflowSteps]);

  const getPriorityBadgeVariant = (
    level: number | undefined
  ): 'default' | 'destructive' | 'outline' | 'secondary' => {
    switch (level) {
      case 4:
        return 'destructive'; // فوري
      case 3:
        return 'destructive'; // مستعجل جدا
      case 2:
        return 'default'; // مستعجل
      case 1:
        return 'secondary'; // عادي
      default:
        return 'outline'; // غير مرتبة
    }
  };

  const getSecrecyBadgeVariant = (
    level: number | undefined
  ): 'default' | 'destructive' | 'outline' | 'secondary' => {
    switch (level) {
      case 3:
        return 'destructive'; // سري للغاية
      case 2:
        return 'default'; // سري
      case 1:
        return 'secondary'; // محدود
      default:
        return 'outline'; // عام
    }
  };

  const onToggleStar = async () => {
    setLoading(true);

    // Optimistic update - update UI immediately
    const newStarredState = !isStarred;
    setLocalIsStarred(newStarredState);

    try {
      if (!data.id) {
        toast.error('Invalid correspondence ID');
        // Rollback optimistic update
        setLocalIsStarred(isStarred);
        return;
      }
      const response = await authApiCall(() =>
        correspondenceService.isStarred(newStarredState, data.id!)
      );
      if (response?.succeeded) {
        toast.success('تم تحديث حالة متابعة الكتابة بنجاح');
        router.refresh();
      } else {
        toast.error('فشل في تحديث حالة متابعة الكتابة');
        setLocalIsStarred(isStarred);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث التمييز بالنجمة');
      setLocalIsStarred(isStarred);
    } finally {
      setLoading(false);
    }
  };

  const onIsTrashed = async () => {
    // Show confirmation dialog instead of immediately executing
    setShowDeleteDialog(true);
  };

  const confirmTrashAction = async () => {
    setLoading(true);
    setShowDeleteDialog(false);

    // Optimistic update - update UI immediately
    const newTrashedState = !isTrashed;
    setLocalIsTrashed(newTrashedState);

    try {
      if (!data.id) {
        toast.error('Invalid correspondence ID');
        // Rollback optimistic update
        setLocalIsTrashed(isTrashed);
        return;
      }

      const response = await authApiCall(() =>
        correspondenceService.isInTrash(newTrashedState, data.id!)
      );

      if (response?.succeeded) {
        toast.success(
          newTrashedState
            ? 'تم نقل الكتابة إلى المهملات بنجاح'
            : 'تم إرجاع الكتابة من المهملات بنجاح'
        );
        // Optional: refresh to sync with server data
        router.refresh();
      } else {
        toast.error('فشل في تحديث حالة المهملات');
        // Rollback optimistic update on failure
        setLocalIsTrashed(isTrashed);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث حالة المهملات');
      // Rollback optimistic update on error
      setLocalIsTrashed(isTrashed);
    } finally {
      setLoading(false);
    }
  };

  async function onLogActionSubmit(
    data: LogRecipientInternalActionInputFormData
  ) {
    try {
      const response = await authApiCall(() =>
        workflowStepService.logRecipientInternalAction(data)
      );
      if (response?.succeeded) {
        toast.success('تم تسجيل الإجراء الداخلي بنجاح');
        router.refresh();
      } else {
        toast.error('فشل في تسجيل الإجراء الداخلي');
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Comment handlers
  const handleCommentAdded = (comment: any) => {
    console.log('Comment added:', comment);
  };

  const handleCommentUpdated = (comment: any) => {
    console.log('Comment updated:', comment);
  };

  const handleCommentDeleted = (commentId: string) => {
    console.log('Comment deleted:', commentId);
  };

  return (
    <div className='flex flex-col gap-6 p-6'>
      {/* Header */}
      <MailHeader
        data={data}
        loading={loading}
        isStarred={isStarred}
        isPostponed={isPostponed}
        isTrashed={isTrashed}
        isOverdue={isOverdue}
        onToggleStar={onToggleStar}
        onIsTrashed={onIsTrashed}
        // onWorkflowStepSubmit={onWorkflowStepSubmit}
        getPriorityBadgeVariant={getPriorityBadgeVariant}
        getSecrecyBadgeVariant={getSecrecyBadgeVariant}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='overview' className='flex items-center gap-2'>
            <FileText className='h-4 w-4' />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value='workflow' className='flex items-center gap-2'>
            <Workflow className='h-4 w-4' />
            سير العمل
            {workflowStatus.active > 0 && (
              <Badge variant='secondary' className='text-xs'>
                {workflowStatus.active}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value='references' className='flex items-center gap-2'>
            <Link className='h-4 w-4' />
            المراجع
            {(data.referencesToCorrespondences?.length || 0) +
              (data.referencedByCorrespondences?.length || 0) >
              0 && (
              <Badge variant='secondary' className='text-xs'>
                {(data.referencesToCorrespondences?.length || 0) +
                  (data.referencedByCorrespondences?.length || 0)}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value='comments' className='flex items-center gap-2'>
            <MessageCircle className='h-4 w-4' />
            التعليقات
          </TabsTrigger>
          <TabsTrigger value='attachments' className='flex items-center gap-2'>
            <FileText className='h-4 w-4' />
            المرفقات
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <TabsContent value='overview' className='space-y-6'>
          <OverviewTab data={data} />
        </TabsContent>

        <TabsContent value='workflow' className='space-y-6'>
          <WorkflowTab data={data} onLogActionSubmit={onLogActionSubmit} />
        </TabsContent>

        <TabsContent value='references' className='space-y-6'>
          <ReferencesTab data={data} />
        </TabsContent>

        <TabsContent value='comments' className='space-y-6'>
          <CommentsTab
            data={data}
            onCommentAdded={handleCommentAdded}
            onCommentUpdated={handleCommentUpdated}
            onCommentDeleted={handleCommentDeleted}
          />
        </TabsContent>

        <TabsContent value='attachments'>
          <AttachmentsTab data={data} />
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className='flex justify-between border-t pt-6'>
        <Button
          variant='outline'
          onClick={() => router.push('/correspondence')}
        >
          العودة للصندوق الوارد
        </Button>

        <div className='flex gap-2'>
          {(data.isDraft ||
            data.correspondenceStatus == 11 ||
            data.correspondenceType === 0) && (
            <Button
              onClick={() =>
                router.push(`/correspondence/mail-form/${data.id}`)
              }
            >
              تعديل الكتاب
            </Button>
          )}

          {data.isDraft && (
            <Button
              onClick={() =>
                router.push(`/correspondence/mail-form/${data.id}`)
              }
            >
              تحرير المسودة
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isTrashed ? 'إرجاع الكتاب' : 'حذف الكتاب'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isTrashed
                ? 'هل أنت متأكد من أنك تريد إرجاع هذا الكتاب من المهملات؟'
                : 'هل أنت متأكد من أنك تريد حذف هذا الكتاب؟ سيتم نقله إلى المهملات.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmTrashAction}
              disabled={loading}
              className={isTrashed ? '' : 'bg-red-600 hover:bg-red-700'}
            >
              {loading ? 'جاري المعالجة...' : isTrashed ? 'إرجاع' : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
