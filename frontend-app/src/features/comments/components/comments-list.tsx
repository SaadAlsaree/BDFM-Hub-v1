import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { commentService } from '../api/comment.service';
import ModernComments from '@/components/comments';

type Props = {
  correspondenceId: string;
};

const CommentsList = ({ correspondenceId }: Props) => {
  // get comments list by correspondence id

  return (
    <div>
      <ModernComments correspondenceId={correspondenceId} />
    </div>
  );
};

export default CommentsList;
