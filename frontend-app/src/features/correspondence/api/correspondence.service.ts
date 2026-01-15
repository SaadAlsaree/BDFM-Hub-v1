import { axiosClient, axiosInstance } from '@/lib/axios';
import { IResponseList, IResponse } from '@/types/response';
import {
  CorrespondenceLinkPayload,
  ExternalCorrespondencePayload,
  InboxList,
  IncomingInternalMailPayload,
  OutgoingInternalMailPayload,
  UpdateCorrespondenceStatusPayload
} from '../types/register-incoming-external-mail';
import {
  CorrespondenceDetails,
  WorkflowStepTodoPayload,
  WorkflowStepTodoStatusPayload
} from '../inbox-list/types/correspondence-details';
import { MailDraftPayload } from '../create-mail-draft/types/mail-draft';
import {
  InternalMailPayload,
  OutgoingExternalMailPayload
} from '../create-internalMail/types/internalMail';
import { CreatePublicMailPayload } from '../create-public-mail/types/create-public-mail';

const baseUrl = process.env.API_URL || 'http://cm-back.inss.local:5000/BDFM/v1/api';

export const correspondenceService = {
  // /Correspondence/CreateOutgoingInternalMail
  async createOutgoingInternalMail(
    outgoingInternalMailPayload: OutgoingInternalMailPayload
  ) {
    try {
      const response = await axiosClient.post(
        `${baseUrl}/Correspondence/CreateOutgoingInternalMail`,
        outgoingInternalMailPayload
      );
      if (response.status >= 400) {
        // console.error('Error creating correspondence data:', response.statusText);
        return null;
      }
      return (response.data as IResponse<string>) || null; // Returns correspondence ID
    } catch (error) {
      //  console.error('Error creating correspondence data:', error);
      return null;
    }
  },

  ///Correspondence/CreateIncomingInternalMail
  async createIncomingInternalMail(
    incomingInternalMailPayload: IncomingInternalMailPayload
  ) {
    try {
      const response = await axiosClient.post(
        `${baseUrl}/Correspondence/CreateIncomingInternalMail`,
        incomingInternalMailPayload
      );
      if (response.status >= 400) {
        // console.error('Error creating correspondence data:', response.statusText);
        return null;
      }
      return (response.data as IResponse<string>) || null; // Returns correspondence ID
    } catch (error) {
      //  console.error('Error creating correspondence data:', error);
      return null;
    }
  },

  // Stage 1: Create correspondence data only (returns correspondence ID)
  async createCorrespondenceData(
    correspondenceData: ExternalCorrespondencePayload
  ) {
    try {
      const response = await axiosClient.post(
        `${baseUrl}/Correspondence/CreateCorrespondenceData`,
        correspondenceData
      );
      if (response.status >= 400) {
        // console.error('Error creating correspondence data:', response.statusText);
        return null;
      }
      return (response.data as IResponse<string>) || null; // Returns correspondence ID
    } catch (error) {
      //  console.error('Error creating correspondence data:', error);
      return null;
    }
  },

  // Stage 2: Link correspondence to another correspondence (optional)
  async linkCorrespondences(
    correspondenceLinkPayload: CorrespondenceLinkPayload
  ) {
    try {
      const response = await axiosClient.post(
        `${baseUrl}/Correspondence/LinkCorrespondences`,
        correspondenceLinkPayload
      );
      if (response.status >= 400) {
        // console.error('Error linking correspondences:', response.statusText);
        return null;
      }
      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error('Error linking correspondences:', error);
      return null;
    }
  },

  // /Correspondence/UpdateCorrespondenceContent
  async updateCorrespondenceContent(correspondenceContent: MailDraftPayload) {
    try {
      const response = await axiosClient.put(
        `${baseUrl}/Correspondence/UpdateCorrespondenceContent`,
        correspondenceContent
      );
      return (response.data as IResponse<boolean>) || null;
    } catch (error) {
      // console.error('Error updating correspondence content:', error);
      return null;
    }
  },

  // Legacy: Full create in one call (kept for backward compatibility)
  async createRegisterIncomingExternalMail(
    registerIncomingExternalMail: InternalMailPayload
  ) {
    try {
      const response = await axiosClient.post(
        `${baseUrl}/Correspondence/RegisterIncomingExternalMail`,
        registerIncomingExternalMail
      );
      if (response.status >= 400) {
        // console.error('Error creating register-incoming-external-mail:', response.statusText);
        return null;
      }
      return (response.data as IResponse<string>) || null;
    } catch (error) {
      // console.error('Error creating register-incoming-external-mail:', error);
      return null;
    }
  },

  //RegisterOutgoingExternalMail
  async createOutgoingExternalMail(
    outgoingExternalMailPayload: OutgoingExternalMailPayload
  ) {
    try {
      const response = await axiosClient.post(
        `${baseUrl}/Correspondence/RegisterOutgoingExternalMail`,
        outgoingExternalMailPayload
      );
      return response.data as IResponse<string>;
    } catch (error) {
      // console.error('Error creating outgoing external mail:', error);
      return null;
    }
  },

  // Gets start
  // search correspondence /Correspondence/SearchCorrespondences
  async searchCorrespondences(searchTerm: string) {
    try {
      const response = await axiosClient.get(
        `${baseUrl}/Correspondence/SearchCorrespondences?SearchTerm=${searchTerm}`
      );
      return response.data as IResponseList<InboxList>;
    } catch (error) {
      // console.error('Error searching correspondences:', error);
      return null;
    }
  },

  //Correspondence/GetUserInbox
  async getUserInbox(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Correspondence/GetUserInbox`,
        {
          params: query
        }
      );
      return response.data as IResponseList<InboxList>;
    } catch (error) {
      // console.error('Error getting user inbox:', error);
      return null;
    }
  },

  ///Correspondence/GetOutgoingInternal
  async getOutgoingInternal(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Correspondence/GetOutgoingInternal`,
        { params: query }
      );
      return response.data as IResponseList<InboxList>;
    } catch (error) {
      // console.error('Error getting outgoing internal:', error);
      return null;
    }
  },

  //Correspondence/GetIncomingInternal
  async getIncomingInternal(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Correspondence/GetIncomingInternal`,
        { params: query }
      );
      return response.data as IResponseList<InboxList>;
    } catch (error) {
      // console.error('Error getting incoming internal:', error);
      return null;
    }
  },

  // get /Correspondence/GetCorrespondenceOutgoing
  async getCorrespondenceOutgoing(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Correspondence/GetCorrespondenceOutgoing`,
        { params: query }
      );
      return response.data as IResponseList<InboxList>;
    } catch (error) {
      // console.error('Error getting correspondence outgoing:', error);
      return null;
    }
  },

  ///Correspondence/GetCorrespondenceIncming
  async getCorrespondenceIncming(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Correspondence/GetCorrespondenceIncming`,
        { params: query }
      );
      return response.data as IResponseList<InboxList>;
    } catch (error) {
      // console.error('Error getting correspondence incoming:', error);
      return null;
    }
  },
  // /Correspondence/GetById
  async getCorrespondenceById(id: string) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Correspondence/GetById?id=${id}`
      );
      return response.data as IResponse<CorrespondenceDetails>;
    } catch (error) {
      // console.error('Error getting correspondence by id:', error);
      return null;
    }
  },

  ///Correspondence/GetTrashItems
  async getTrashItems(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Correspondence/GetTrashItems`,
        { params: query }
      );
      return response.data as IResponseList<InboxList>;
    } catch (error) {
      // console.error('Error getting trash items:', error);
      return null;
    }
  },

  //Correspondence/GetStarredItems
  async getStarredItems(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Correspondence/GetStarredItems`,
        { params: query }
      );
      return response.data as IResponseList<InboxList>;
    } catch (error) {
      // console.error('Error getting starred items:', error);
      return null;
    }
  },

  // /Correspondence/GetUserDrafts
  async getUserDrafts(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Correspondence/GetUserDrafts`,
        { params: query }
      );
      return response.data as IResponseList<InboxList>;
    } catch (error) {
      // console.error('Error getting user drafts:', error);
      return null;
    }
  },

  // /Correspondence/GetPostponedCorrespondences
  async getPostponedCorrespondences(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Correspondence/GetPostponedCorrespondences`,
        { params: query }
      );
      return response.data as IResponseList<InboxList>;
    } catch (error) {
      // console.error('Error getting postponed correspondences:', error);
      return null;
    }
  },

  ///Correspondence/GetLateBooks
  async getLateBooks(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Correspondence/GetLateBooks`,
        { params: query }
      );
      return response.data as IResponseList<InboxList>;
    } catch (error) {
      // console.error('Error getting late books:', error);
      return null;
    }
  },

  ///Correspondence/GetUrgentBooks
  async getUrgentBooks(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Correspondence/GetUrgentBooks`,
        { params: query }
      );
      return response.data as IResponseList<InboxList>;
    } catch (error) {
      // console.error('Error getting urgent books:', error);
      return null;
    }
  },

  //GetSigningList
  async getSigningList(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Correspondence/GetSigningList`,
        { params: query }
      );
      return response.data as IResponseList<InboxList>;
    } catch (error) {
      // console.error('Error getting signing list:', error);
      return null;
    }
  },

  // /BDFM/v1/api/Correspondence/GetPublicMails
  async getPublicMails(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Correspondence/GetPublicMails`,
        { params: query }
      );
      return response.data as IResponseList<InboxList>;
    } catch (error) {
      // console.error('Error getting public mails:', error);
      return null;
    }
  },

  // /Correspondence/SearchCorrespondences
  // async searchCorrespondences(query: Record<string, any>) {
  //     try {
  //         const  response = await axiosInstance.get(`${baseUrl}/Correspondence/GetSigningList`, { params: query });
  //         return response.data as IResponseList<InboxList>;
  //     } catch (error) {
  //         return null
  //     }
  // },

  //Gets end

  //Posts start
  // /Correspondence/CreateInternalMail
  async createInternalMail(internalMailPayload: InternalMailPayload) {
    try {
      const response = await axiosClient.post(
        `${baseUrl}/Correspondence/CreateInternalMail`,
        internalMailPayload
      );
      return response.data as IResponse<string>;
    } catch (error) {
      // console.error('Error creating internal mail:', error);
      return null;
    }
  },

  // /Correspondence/CreateMailDraft
  async createMailDraft(mailDraftPayload: MailDraftPayload) {
    try {
      const response = await axiosClient.post(
        `${baseUrl}/Correspondence/CreateMailDraft`,
        mailDraftPayload
      );
      return response.data as IResponse<string>;
    } catch (error) {
      // console.error('Error creating mail draft:', error);
      return null;
    }
  },

  // /BDFM/v1/api/Correspondence/CreatePublicCorrespondence
  async createPublicCorrespondence(
    createPublicMailPayload: CreatePublicMailPayload
  ) {
    try {
      const response = await axiosClient.post(
        `${baseUrl}/Correspondence/CreatePublicCorrespondence`,
        createPublicMailPayload
      );
      return response.data as IResponse<string>;
    } catch (error) {
      // console.error('Error creating public correspondence:', error);
      return null;
    }
  },

  // UserCorrespondenceInteraction Start
  // 1- /UserCorrespondenceInteraction/IsInTrash fromBody (isInTrash: boolean, correspondenceId: string)
  async isInTrash(isInTrash: boolean, correspondenceId: string) {
    const payload = {
      isInTrash,
      correspondenceId
    };
    try {
      const response = await axiosClient.post(
        `${baseUrl}/UserCorrespondenceInteraction/IsInTrash`,
        payload
      );
      return response.data as IResponse<boolean>;
    } catch (error) {
      // console.error('Error checking if correspondence is in trash:', error);
      return null;
    }
  },

  // 2- /UserCorrespondenceInteraction/IsPostponed
  async isPostponed(postponeDate: string, correspondenceId: string) {
    const payload = {
      postponeDate,
      correspondenceId
    };
    try {
      const response = await axiosClient.post(
        `${baseUrl}/UserCorrespondenceInteraction/IsPostponed`,
        payload
      );
      return response.data as IResponse<boolean>;
    } catch (error) {
      // console.error('Error checking if correspondence is postponed:', error);
      return null;
    }
  },

  // 3- /UserCorrespondenceInteraction/IsRead
  async isRead(isRead: boolean, correspondenceId: string) {
    const payload = {
      isRead,
      correspondenceId
    };
    try {
      const response = await axiosClient.post(
        `${baseUrl}/UserCorrespondenceInteraction/IsRead`,
        payload
      );
      return response.data as IResponse<boolean>;
    } catch (error) {
      // console.error('Error checking if correspondence is read:', error);
      return null;
    }
  },

  // 4- /UserCorrespondenceInteraction/IsStarred
  async isStarred(isStarred: boolean, correspondenceId: string) {
    const payload = {
      isStarred,
      correspondenceId
    };
    try {
      const response = await axiosClient.post(
        `${baseUrl}/UserCorrespondenceInteraction/IsStarred`,
        payload
      );
      return response.data as IResponse<boolean>;
    } catch (error) {
      //  console.error('Error checking if correspondence is starred:', error);
      return null;
    }
  },

  // 5- //UserCorrespondenceInteraction/ReceiveNotification
  async receiveNotification(
    receiveNotifications: boolean,
    correspondenceId: string
  ) {
    const payload = {
      receiveNotifications,
      correspondenceId
    };
    try {
      const response = await axiosClient.post(
        `${baseUrl}/UserCorrespondenceInteraction/ReceiveNotification`,
        payload
      );
      return response.data as IResponse<boolean>;
    } catch (error) {
      // console.error('Error checking if correspondence is received:', error);
      return null;
    }
  },

  // /Correspondence/ChangeCorrespondenceStatus
  async changeCorrespondenceStatus(payload: UpdateCorrespondenceStatusPayload) {
    try {
      const response = await axiosClient.put(
        `${baseUrl}/Correspondence/ChangeCorrespondenceStatus`,
        payload
      );
      return response.data as IResponse<boolean>;
    } catch (error) {
      console.error('Error changing correspondence status:', error);
      return null;
    }
  },

  // Todo Start
  // /WorkflowTodo/CreateWorkflowTodo
  async createWorkflowStepTodo(payload: WorkflowStepTodoPayload) {
    try {
      const response = await axiosClient.post(
        `${baseUrl}/WorkflowTodo/CreateWorkflowTodo`,
        payload
      );
      return response.data as IResponse<boolean>;
    } catch (error) {
      // console.error('Error creating workflow step todo:', error);
      return null;
    }
  },

  // /WorkflowTodo/UpdateWorkflowTodo
  async updateWorkflowStepTodo(payload: WorkflowStepTodoPayload) {
    try {
      const response = await axiosClient.put(
        `${baseUrl}/WorkflowTodo/UpdateWorkflowTodo`,
        payload
      );
      return response.data as IResponse<boolean>;
    } catch (error) {
      // console.error('Error updating workflow step todo:', error);
      return null;
    }
  },

  // /BDFM/v1/api/WorkflowTodo/UpdateWorkflowTodoStatus/UpdateStatus
  async updateWorkflowStepTodoStatus(payload: WorkflowStepTodoStatusPayload) {
    try {
      const response = await axiosClient.patch(
        `${baseUrl}/WorkflowTodo/UpdateWorkflowTodoStatus/UpdateStatus`,
        payload
      );
      return response.data as IResponse<boolean>;
    } catch (error) {
      // console.error('Error updating workflow step todo status:', error);
      return null;
    }
  },

  // /WorkflowTodo/DeleteWorkflowTodo/{workflowStepTodoId}
  async deleteWorkflowStepTodo(workflowStepTodoId: string) {
    try {
      const response = await axiosClient.delete(
        `${baseUrl}/WorkflowTodo/DeleteWorkflowTodo/${workflowStepTodoId}`
      );
      return response.data as IResponse<boolean>;
    } catch (error) {
      // console.error('Error deleting workflow step todo:', error);
      return null;
    }
  },

  // /BDFM/v1/api/WorkflowTodo/GetWorkflowTodoByWorkflowId
  async getWorkflowStepTodoByWorkflowId(query: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/WorkflowTodo/GetWorkflowTodoByWorkflowId`,
        { params: query }
      );
      return response.data as IResponseList<WorkflowStepTodoPayload>;
    } catch (error) {
      // console.error('Error getting workflow step todo by workflow id:', error);
      return null;
    }
  },

  ///BDFM/v1/api/Correspondence/GetCorrespondencesSummary
  async getCorrespondencesSummary(searchParams?: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Correspondence/GetCorrespondencesSummary`,
        { params: searchParams }
      );
      return response.data;
    } catch (error) {
      // console.error('Error getting correspondences summary:', error);
      return null;
    }
  },

  ///BDFM/v1/api/Correspondence/GetCorrespondencesSummary Client
  async getCorrespondencesSummaryClient(searchParams?: Record<string, any>) {
    try {
      const response = await axiosClient.get(
        `${baseUrl}/Correspondence/GetCorrespondencesSummary`,
        { params: searchParams }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting correspondences summary client:', error);
      return null;
    }
  },

  // UserCorrespondenceInteraction End

  ///BDFM/v1/api/Correspondence/GetPending
  async getPendingCorrespondences(searchParams?: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Correspondence/GetPending`,
        { params: searchParams }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting pending correspondences:', error);
      return null;
    }
  },

  ///BDFM/v1/api/Correspondence/GetProcessing
  async getProcessingCorrespondences(searchParams?: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Correspondence/GetProcessing`,
        { params: searchParams }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting processing correspondences:', error);
      return null;
    }
  },

  ///BDFM/v1/api/Correspondence/GetReturnForEditing
  async getReturnForEditingCorrespondences(searchParams?: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Correspondence/GetReturnForEditing`,
        { params: searchParams }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting return for editing correspondences:', error);
      return null;
    }
  },

  ///BDFM/v1/api/Correspondence/GetCompleted
  async getCompletedCorrespondences(searchParams?: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Correspondence/GetCompleted`,
        { params: searchParams }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting completed correspondences:', error);
      return null;
    }
  },

  //#region Not Completed Correspondences
  ///BDFM/v1/api/Correspondence/GetNotCompletedCorrespondences
  async getNotCompletedCorrespondences(searchParams?: Record<string, any>) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Correspondence/GetNotCompletedCorrespondences`,
        { params: searchParams }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting not completed correspondences:', error);
      return null;
    }
  },

  //BDFM/v1/api/Correspondence/GetPendingOrInProgressCorrespondences
  async getPendingOrInProgressCorrespondences(
    searchParams?: Record<string, any>
  ) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Correspondence/GetPendingOrInProgressCorrespondences`,
        { params: searchParams }
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error getting pending or in progress correspondences:',
        error
      );
      return null;
    }
  },

  //BDFM/v1/api/Correspondence/GetMyPendingOrInProgressCorrespondences
  async getMyPendingOrInProgressCorrespondences(
    searchParams?: Record<string, any>
  ) {
    try {
      const response = await axiosInstance.get(
        `${baseUrl}/Correspondence/GetMyPendingOrInProgressCorrespondences`,
        { params: searchParams }
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error getting my pending or in progress correspondences:',
        error
      );
      return null;
    }
  }

  //#endregion Not Completed Correspondences
};
