import { axiosClient, axiosInstance } from '@/lib/axios';
import { IResponse } from '@/types/response';
import {
  ICommentList,
  ICommentDetails,
  ICommentCreate,
  ICommentUpdate,
  ICommentDelete
} from '@/features/comments/types/comments';

const baseUrl = process.env.API_URL || 'http://localhost:5000/BDFM/v1/api';

export const commentService = {
  // /Comments/GetCommentsListByCorrespondenceId/{correspondenceId}/correspondence
  async getComments(correspondenceId: string) {
    try {
      const response = await axiosClient.get(
        `${baseUrl}/Comments/GetCommentsListByCorrespondenceId/${correspondenceId}/correspondence?includeReplies=true`
      );
      if (response.status >= 400) {
        // console.error('Error fetching comments:', response.statusText);
        return null;
      }
      return response.data as IResponse<ICommentList[]>;
    } catch (error) {
      // console.error('Exception fetching comments:', error);
      return null;
    }
  },

  // Comments/CreateComment create comment
  async createComment(comment: ICommentCreate) {
    try {
      const response = await axiosClient.post(
        `${baseUrl}/Comments/CreateComment`,
        comment
      );
      if (response.status >= 400) {
        // console.error('Error creating comment:', response.statusText);
        return response;
      }
      return response.data as IResponse<ICommentDetails>;
    } catch (error) {
      // console.error('Exception creating comment:', error);
      return null;
    }
  },

  // Comments/UpdateComment update comment
  async updateComment(comment: ICommentUpdate) {
    try {
      const response = await axiosClient.put(
        `${baseUrl}/Comments/UpdateComment`,
        comment
      );
      if (response.status >= 400) {
        // console.error('Error updating comment:', response.statusText);
        return response;
      }
      return response.data as IResponse<ICommentDetails>;
    } catch (error) {
      // console.error('Exception updating comment:', error);
      return null;
    }
  },

  // Comments/DeleteComment delete comment
  async deleteComment(comment: ICommentDelete) {
    try {
      const response = await axiosClient.delete(
        `${baseUrl}/Comments/DeleteComment`,
        { data: comment }
      );
      if (response.status >= 400) {
        // console.error('Error deleting comment:', response.statusText);
        return response;
      }
      return response.data as IResponse<ICommentDetails>;
    } catch (error) {
      // console.error('Exception deleting comment:', error);
      return null;
    }
  }
};
