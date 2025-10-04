'use client';

import ModernComments from '@/components/comments';
import { CorrespondenceDetails } from '../../types/correspondence-details';

interface CommentsTabProps {
  data: CorrespondenceDetails;
  onCommentAdded: (comment: any) => void;
  onCommentUpdated: (comment: any) => void;
  onCommentDeleted: (commentId: string) => void;
}

export function CommentsTab({
  data,
  onCommentAdded,
  onCommentUpdated,
  onCommentDeleted
}: CommentsTabProps) {
  return (
    <ModernComments
      correspondenceId={data.id}
      workflowStepId={data.workflowSteps?.[0]?.id}
      onCommentAdded={onCommentAdded}
      onCommentUpdated={onCommentUpdated}
      onCommentDeleted={onCommentDeleted}
    />
  );
}
