'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  MessageCircle,
  MoreHorizontal,
  Reply,
  Send,
  Edit3,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
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
import {
  ICommentList,
  ICommentCreate,
  ICommentUpdate,
  CommentVisibility,
  CommentVisibilityLabels
} from '@/features/comments/types/comments';
import { commentService } from '@/features/comments/api/comment.service';
import { useAuthApi } from '@/hooks/use-auth-api';
import { Separator } from './ui/separator';

interface ModernCommentsProps {
  correspondenceId: string;
  workflowStepId?: string;
  onCommentAdded?: (comment: ICommentList) => void;
  onCommentUpdated?: (comment: ICommentList) => void;
  onCommentDeleted?: (commentId: string) => void;
}

export default function ModernComments({
  correspondenceId,
  workflowStepId,
  onCommentAdded,
  onCommentUpdated,
  onCommentDeleted
}: ModernCommentsProps) {
  const [comments, setComments] = useState<ICommentList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authApiCall } = useAuthApi();

  // Form states
  const [newComment, setNewComment] = useState('');
  const [newCommentVisibility, setNewCommentVisibility] =
    useState<CommentVisibility>(CommentVisibility.InternalUsers);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Map<string, string>>(new Map());
  const [replyVisibilities, setReplyVisibilities] = useState<
    Map<string, CommentVisibility>
  >(new Map());

  // Edit states
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editVisibility, setEditVisibility] = useState<CommentVisibility>(
    CommentVisibility.InternalUsers
  );

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<{
    id: string;
    parentId?: string;
  } | null>(null);

  // Load comments on mount
  useEffect(() => {
    loadComments();
  }, [correspondenceId]);

  const loadComments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApiCall(() =>
        commentService.getComments(correspondenceId)
      );
      if (response?.succeeded && response.data) {
        setComments(response?.data as ICommentList[]);
      } else {
        setError('فشل في تحميل التعليقات');
      }
    } catch (err) {
      setError('حدث خطأ أثناء تحميل التعليقات');
      console.error('Error loading comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const commentData: ICommentCreate = {
      correspondenceId,
      text: newComment.trim(),
      workflowStepId,
      visibility: newCommentVisibility
    };

    try {
      const response = await authApiCall(() =>
        commentService.createComment(commentData)
      );
      if (
        response &&
        'succeeded' in response &&
        response.succeeded &&
        response.data
      ) {
        // Reload comments to get the updated list
        await loadComments();
        setNewComment('');
        setNewCommentVisibility(CommentVisibility.InternalUsers);
        onCommentAdded?.(response.data as unknown as ICommentList);
      } else {
        setError('فشل في إضافة التعليق');
      }
    } catch (err) {
      setError('حدث خطأ أثناء إضافة التعليق');
      console.error('Error adding comment:', err);
    }
  };

  const handleAddReply = async (parentId: string) => {
    if (!replyTexts.get(parentId)?.trim()) return;

    const replyData: ICommentCreate = {
      correspondenceId,
      text: replyTexts.get(parentId)?.trim() || '',
      workflowStepId,
      parentCommentId: parentId,
      visibility:
        replyVisibilities.get(parentId) || CommentVisibility.InternalUsers
    };

    try {
      const response = await authApiCall(() =>
        commentService.createComment(replyData)
      );
      if (response && 'succeeded' in response && response.succeeded) {
        // Reload comments to get the updated list with the new reply
        await loadComments();
        setReplyTexts((prev) => {
          const newMap = new Map(prev);
          newMap.delete(parentId);
          return newMap;
        });
        setReplyVisibilities((prev) => {
          const newMap = new Map(prev);
          newMap.delete(parentId);
          return newMap;
        });
        setReplyingTo(null);
      } else {
        setError('فشل في إضافة الرد');
      }
    } catch (err) {
      setError('حدث خطأ أثناء إضافة الرد');
      console.error('Error adding reply:', err);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return;

    const updateData: ICommentUpdate = {
      id: commentId,
      text: editText.trim(),
      visibility: editVisibility
    };

    try {
      const response = await authApiCall(() =>
        commentService.updateComment(updateData)
      );
      if (response && 'succeeded' in response && response.succeeded) {
        // Reload comments to get the updated list
        await loadComments();
        setEditingComment(null);
        setEditText('');
        onCommentUpdated?.(response.data as unknown as ICommentList);
      } else {
        setError('فشل في تحديث التعليق');
      }
    } catch (err) {
      setError('حدث خطأ أثناء تحديث التعليق');
      console.error('Error updating comment:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await authApiCall(() =>
        commentService.deleteComment({ id: commentId })
      );
      if (response && 'succeeded' in response && response.succeeded) {
        // Reload comments to get the updated list
        await loadComments();
        setDeleteConfirmOpen(false);
        setCommentToDelete(null);
        onCommentDeleted?.(commentId);
      } else {
        setError('فشل في حذف التعليق');
      }
    } catch (err) {
      setError('حدث خطأ أثناء حذف التعليق');
      console.error('Error deleting comment:', err);
    }
  };

  const confirmDelete = (commentId: string, parentId?: string) => {
    setCommentToDelete({ id: commentId, parentId });
    setDeleteConfirmOpen(true);
  };

  const startEdit = (comment: ICommentList) => {
    setEditingComment(comment.id);
    setEditText(comment.text);
    setEditVisibility(comment.visibility as CommentVisibility);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getVisibilityIcon = (visibility: number) => {
    switch (visibility) {
      case CommentVisibility.PrivateToAuthorAndMentions:
        return <EyeOff className='h-3 w-3' />;
      case CommentVisibility.SpecificUnits:
        return <Eye className='h-3 w-3' />;
      default:
        return null;
    }
  };

  const CommentItem = ({
    comment,
    parentId
  }: {
    comment: ICommentList;
    parentId?: string;
  }) => (
    <Card
      className='border-0 bg-transparent shadow-none'
      data-comment-id={comment.id}
    >
      <CardContent className='p-0'>
        <div className='flex flex-row-reverse gap-3'>
          <Avatar className='border-background h-10 w-10 border-2 shadow-sm'>
            <AvatarImage src='/avatar.jpg' alt={comment.employeeName} />
            <AvatarFallback className='bg-gradient-to-br from-blue-500 to-purple-600 font-semibold text-white'>
              {comment.employeeName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          <div className='flex-1 space-y-2'>
            {editingComment === comment.id ? (
              <div className='space-y-3'>
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className='border-muted-foreground/20 min-h-[80px] resize-none text-right transition-colors focus:border-blue-500'
                  dir='rtl'
                />
                <Select
                  value={editVisibility.toString()}
                  onValueChange={(value) =>
                    setEditVisibility(parseInt(value) as CommentVisibility)
                  }
                >
                  <SelectTrigger className='w-full text-right'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CommentVisibilityLabels).map(
                      ([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <div className='flex justify-start gap-2'>
                  <Button
                    size='sm'
                    onClick={() => handleEditComment(comment.id)}
                    disabled={!editText.trim() || editText === comment.text}
                    className='h-8 rounded-full px-3 text-xs'
                  >
                    حفظ
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={cancelEdit}
                    className='h-8 rounded-full px-3 text-xs'
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            ) : (
              <div className='bg-muted/50 hover:bg-muted/70 rounded-2xl px-4 py-3 transition-colors'>
                <div className='mb-1 gap-2'>
                  <div className='flex flex-row-reverse items-center justify-start gap-2'>
                    <span className='text-sm font-semibold'>
                      {comment.employeeName}
                    </span>
                    <span className='text-muted-foreground text-xs'>
                      {comment.userLogin}
                    </span>
                    <span className='text-muted-foreground text-xs'>•</span>
                    <span className='text-muted-foreground text-xs'>
                      {comment.employeeUnitName}
                    </span>
                  </div>
                  <div className='flex flex-row-reverse items-center justify-end gap-2'>
                    <span className='text-muted-foreground text-xs'>•</span>
                    <span className='text-muted-foreground text-xs'>
                      {formatDate(comment.createAt)}
                    </span>
                    {comment.isEdited && (
                      <>
                        <span className='text-muted-foreground text-xs'>•</span>
                        <span className='text-muted-foreground text-xs'>
                          تم التعديل
                        </span>
                      </>
                    )}
                  </div>
                  <Separator className='my-2' />
                  {getVisibilityIcon(comment.visibility) && (
                    <>
                      <span className='text-muted-foreground text-xs'>•</span>
                      <span className='text-muted-foreground flex items-center gap-1 text-xs'>
                        {getVisibilityIcon(comment.visibility)}
                        {
                          CommentVisibilityLabels[
                            comment.visibility as CommentVisibility
                          ]
                        }
                      </span>
                    </>
                  )}
                </div>
                <p className='text-right text-sm leading-relaxed' dir='rtl'>
                  {comment.text}
                </p>
              </div>
            )}

            <div className='flex flex-row-reverse items-center justify-end gap-1 px-2'>
              {!parentId && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-muted-foreground h-8 gap-1.5 rounded-full px-3 text-xs transition-all duration-200 hover:bg-blue-50 hover:text-blue-600'
                  onClick={() =>
                    setReplyingTo(replyingTo === comment.id ? null : comment.id)
                  }
                >
                  <Reply className='h-3.5 w-3.5 scale-x-[-1]' />
                  رد
                </Button>
              )}

              {comment.canEdit && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-muted-foreground h-8 gap-1.5 rounded-full px-3 text-xs transition-all duration-200 hover:bg-green-50 hover:text-green-600'
                  onClick={() => startEdit(comment)}
                >
                  <Edit3 className='h-3.5 w-3.5' />
                  تعديل
                </Button>
              )}

              {comment.canDelete && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-muted-foreground h-8 gap-1.5 rounded-full px-3 text-xs transition-all duration-200 hover:bg-red-50 hover:text-red-600'
                  onClick={() => confirmDelete(comment.id, parentId)}
                >
                  <Trash2 className='h-3.5 w-3.5' />
                  حذف
                </Button>
              )}

              <Button
                variant='ghost'
                size='sm'
                className='text-muted-foreground hover:text-foreground hover:bg-muted h-8 w-8 rounded-full p-0 transition-all duration-200'
              >
                <MoreHorizontal className='h-3.5 w-3.5' />
              </Button>
            </div>

            {replyingTo === comment.id && (
              <div className='animate-in slide-in-from-top-2 mt-3 duration-200'>
                <div className='mb-3 flex flex-row-reverse gap-2'>
                  <Avatar className='border-background h-8 w-8 border'>
                    <AvatarImage src='/placeholder.svg' alt='You' />
                    <AvatarFallback className='bg-gradient-to-br from-green-500 to-blue-600 text-xs font-semibold text-white'>
                      أ
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex flex-1 gap-2'>
                    <div className='flex flex-col gap-1'>
                      <Button
                        size='sm'
                        onClick={() => handleAddReply(comment.id)}
                        disabled={!replyTexts.get(comment.id)?.trim()}
                        className='h-8 w-8 rounded-full p-0'
                      >
                        <Send className='h-3.5 w-3.5 scale-x-[-1]' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyTexts((prev) => {
                            const newMap = new Map(prev);
                            newMap.delete(comment.id);
                            return newMap;
                          });
                          setReplyVisibilities((prev) => {
                            const newMap = new Map(prev);
                            newMap.delete(comment.id);
                            return newMap;
                          });
                        }}
                        className='h-8 w-8 rounded-full p-0'
                      >
                        ×
                      </Button>
                    </div>
                    <div className='flex-1 space-y-2'>
                      <Textarea
                        key={`reply-${comment.id}`}
                        placeholder={`رد على ${comment.employeeName}...`}
                        value={replyTexts.get(comment.id) || ''}
                        onChange={(e) =>
                          setReplyTexts((prev) => {
                            const newMap = new Map(prev);
                            newMap.set(comment.id, e.target.value);
                            return newMap;
                          })
                        }
                        className='border-muted-foreground/20 min-h-[80px] resize-none text-right transition-colors focus:border-blue-500'
                        dir='rtl'
                        autoFocus
                      />
                      <Select
                        value={
                          replyVisibilities.get(comment.id)?.toString() ||
                          CommentVisibility.InternalUsers.toString()
                        }
                        onValueChange={(value) =>
                          setReplyVisibilities((prev) => {
                            const newMap = new Map(prev);
                            newMap.set(
                              comment.id,
                              parseInt(value) as CommentVisibility
                            );
                            return newMap;
                          })
                        }
                      >
                        <SelectTrigger className='w-full text-right'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CommentVisibilityLabels).map(
                            ([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <div className='border-muted mt-4 space-y-4 border-r-2 pr-4'>
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    parentId={comment.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className='mx-auto max-w-2xl space-y-6 p-6' dir='rtl'>
        <div className='flex items-center justify-between'>
          <div className='text-muted-foreground flex items-center gap-2 text-sm'>
            <MessageCircle className='h-4 w-4 animate-pulse' />
            جاري التحميل...
          </div>
          <h2 className='text-2xl font-bold'>التعليقات</h2>
        </div>
        <div className='space-y-4'>
          {[1, 2, 3].map((i) => (
            <Card key={i} className='border-muted-foreground/20'>
              <CardContent className='p-4'>
                <div className='animate-pulse'>
                  <div className='flex flex-row-reverse gap-3'>
                    <div className='bg-muted h-10 w-10 rounded-full'></div>
                    <div className='flex-1 space-y-2'>
                      <div className='bg-muted h-4 w-1/3 rounded'></div>
                      <div className='bg-muted h-16 rounded'></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-2xl space-y-6 p-6' dir='rtl'>
      <div className='flex items-center justify-between'>
        <div className='text-muted-foreground flex items-center gap-2 text-sm'>
          <MessageCircle className='h-4 w-4' />
          {comments.length} {comments.length === 1 ? 'تعليق' : 'تعليقات'}
        </div>
        <h2 className='text-2xl font-bold'>التعليقات</h2>
      </div>

      {/* Add new comment */}
      <Card className='border-muted-foreground/20'>
        <CardContent className='p-4'>
          <div className='flex flex-row-reverse gap-3'>
            <Avatar className='border-background h-10 w-10 border-2 shadow-sm'>
              <AvatarImage src='/placeholder.svg' alt='You' />
              <AvatarFallback className='bg-gradient-to-br from-green-500 to-blue-600 font-semibold text-white'>
                أ
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 space-y-3'>
              <Textarea
                placeholder='شارك أفكارك...'
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className='border-muted-foreground/20 min-h-[100px] resize-none text-right transition-colors focus:border-blue-500'
                dir='rtl'
              />
              <div className='flex items-center justify-between'>
                <div className='flex gap-2'>
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className='gap-2 rounded-full px-6'
                  >
                    <Send className='h-4 w-4 scale-x-[-1]' />
                    نشر التعليق
                  </Button>
                </div>
                <Select
                  value={newCommentVisibility.toString()}
                  onValueChange={(value) =>
                    setNewCommentVisibility(
                      parseInt(value) as CommentVisibility
                    )
                  }
                >
                  <SelectTrigger className='w-48 text-right'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CommentVisibilityLabels).map(
                      ([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments list */}
      <div className='space-y-6'>
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>

      {comments.length === 0 && (
        <div className='text-muted-foreground py-12 text-center'>
          <MessageCircle className='mx-auto mb-4 h-12 w-12 opacity-50' />
          <p className='mb-2 text-lg font-medium'>لا توجد تعليقات بعد</p>
          <p className='text-sm'>كن أول من يشارك أفكاره!</p>
        </div>
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent dir='rtl'>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex flex-row-reverse items-center justify-end gap-2'>
              <AlertTriangle className='h-5 w-5 text-red-500' />
              حذف التعليق
            </AlertDialogTitle>
            <AlertDialogDescription className='text-right'>
              هل أنت متأكد من أنك تريد حذف هذا التعليق؟ لا يمكن التراجع عن هذا
              الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='flex-row-reverse'>
            <AlertDialogAction
              onClick={() =>
                commentToDelete && handleDeleteComment(commentToDelete.id)
              }
              className='bg-red-600 hover:bg-red-700 focus:ring-red-600'
            >
              حذف التعليق
            </AlertDialogAction>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
