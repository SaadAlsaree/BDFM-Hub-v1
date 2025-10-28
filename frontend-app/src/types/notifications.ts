export interface Notification {
  id: string;
  message: string;
  notificationType: NotificationType;
  notificationTypeName: string;
  isRead: boolean;
  createAt: string; // ISO date string
  linkToCorrespondenceId?: string;
  linkToWorkflowStepId?: string;
  correspondenceSubject?: string;
  correspondenceMailNum?: string;
}

export enum NotificationType {
  NewMail = 0,
  StatusUpdate = 1,
  WorkflowAssignment = 2,
  SystemAlert = 3
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  notificationTypes: {
    newMail: boolean;
    statusUpdates: boolean;
    workflowAssignments: boolean;
    systemAlerts: boolean;
  };
}

// SignalR Event Types
export interface SignalREvents {
  CorrespondenceAssignedToModule: (data: {
    correspondenceId: string;
    moduleId: string;
    moduleName: string;
    subject: string;
    message: string;
  }) => void;

  CorrespondenceStatusChangedWithNotification: (data: {
    correspondenceId: string;
    newStatus: string;
    message: string;
    userId: string;
  }) => void;

  WorkflowStepCreated: (data: {
    workflowStepId: string;
    correspondenceId: string;
    recipientType: string;
    message: string;
  }) => void;

  CorrespondenceCreated: (data: {
    correspondenceId: string;
    subject: string;
    correspondenceType: string;
    createdBy: string;
    createdAt: string;
  }) => void;

  CorrespondenceUpdated: (data: {
    correspondenceId: string;
    subject: string;
    updatedFields: string[];
    updatedBy: string;
    updatedAt: string;
  }) => void;

  CorrespondenceDeleted: (data: {
    correspondenceId: string;
    subject: string;
    deletedBy: string;
    deletedAt: string;
  }) => void;

  CorrespondenceStatusChanged: (data: {
    correspondenceId: string;
    oldStatus: string;
    newStatus: string;
    changedBy: string;
    changedAt: string;
  }) => void;

  InboxUpdated: (data: {
    userId: string;
    moduleId?: string;
    correspondenceCount: number;
    unreadCount: number;
  }) => void;

  WorkflowStepCompleted: (data: {
    workflowStepId: string;
    correspondenceId: string;
    completedBy: string;
    completedAt: string;
    nextStepId?: string;
  }) => void;

  WorkflowStepAssigned: (data: {
    workflowStepId: string;
    correspondenceId: string;
    assignedTo: string;
    assignedBy: string;
    dueDate?: string;
  }) => void;

  WorkflowStepStatusChanged: (data: {
    workflowStepId: string;
    correspondenceId: string;
    oldStatus: string;
    newStatus: string;
    changedBy: string;
    changedAt: string;
    message: string;
  }) => void;
}

// API Query Parameters
export interface NotificationQuery {
  page?: number;
  pageSize?: number;
  isRead?: boolean;
  notificationType?: NotificationType;
}

// Component Props
export interface NotificationBellProps {
  className?: string;
}

export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onClick?: (notification: Notification) => void;
  compact?: boolean;
}

export interface NotificationListProps {
  notifications: Notification[];
  loading?: boolean;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onNotificationClick?: (notification: Notification) => void;
  compact?: boolean;
}

export interface NotificationFiltersProps {
  filters: NotificationQuery;
  onFiltersChange: (filters: NotificationQuery) => void;
}

// SignalR Connection State
export interface SignalRConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastReconnectAttempt: Date | null;
}

// Notification Context
export interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  connectionState: SignalRConnectionState;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  preferences: NotificationPreferences;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
}

// Utility Types
export type NotificationSound = 'default' | 'chime' | 'bell' | 'none';

export interface NotificationToastOptions {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
