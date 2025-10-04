import ModernComments from './comments';

export default function CommentsExample() {
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
    <div className='container mx-auto py-8'>
      <ModernComments
        correspondenceId='example-correspondence-id'
        workflowStepId='example-workflow-step-id'
        onCommentAdded={handleCommentAdded}
        onCommentUpdated={handleCommentUpdated}
        onCommentDeleted={handleCommentDeleted}
      />
    </div>
  );
}
