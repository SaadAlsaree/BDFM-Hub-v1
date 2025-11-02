import { z } from 'zod';
import {
  LeaveRequest,
  LeaveRequestStatus,
  LeaveType,
  LeaveRequestStatusDisplay
} from '../types/leave-request';

export const createLeaveRequestSchema = z.object({
  employeeId: z.string().min(1, 'معرف الموظف مطلوب'),
  organizationalUnitId: z.string().optional(),
  leaveType: z.number().int().min(1).max(7),
  startDate: z.string().min(1, 'تاريخ بداية الإجازة مطلوب'),
  endDate: z.string().min(1, 'تاريخ نهاية الإجازة مطلوب'),
  reason: z.string().max(1000, 'السبب يجب ألا يتجاوز 1000 حرف').optional()
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'تاريخ نهاية الإجازة يجب أن يكون بعد تاريخ البداية',
    path: ['endDate']
  }
);

export type CreateLeaveRequestFormValues = z.infer<
  typeof createLeaveRequestSchema
>;

export const updateLeaveRequestSchema = z.object({
  id: z.string().uuid('معرف طلب الإجازة غير صحيح'),
  leaveType: z.number().int().min(1).max(7).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  reason: z.string().max(1000, 'السبب يجب ألا يتجاوز 1000 حرف').optional()
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'تاريخ نهاية الإجازة يجب أن يكون بعد تاريخ البداية',
    path: ['endDate']
  }
);

export type UpdateLeaveRequestFormValues = z.infer<
  typeof updateLeaveRequestSchema
>;

export const approveLeaveRequestSchema = z.object({
  id: z.string().uuid('معرف طلب الإجازة غير صحيح'),
  approvedDays: z.number().int().positive('عدد الأيام المعتمدة يجب أن يكون أكبر من صفر').optional(),
  notes: z.string().max(1000, 'الملاحظات يجب ألا تتجاوز 1000 حرف').optional()
});

export type ApproveLeaveRequestFormValues = z.infer<
  typeof approveLeaveRequestSchema
>;

export const rejectLeaveRequestSchema = z.object({
  id: z.string().uuid('معرف طلب الإجازة غير صحيح'),
  rejectionReason: z.string().min(1, 'سبب الرفض مطلوب').max(1000, 'سبب الرفض يجب ألا يتجاوز 1000 حرف')
});

export type RejectLeaveRequestFormValues = z.infer<
  typeof rejectLeaveRequestSchema
>;

export const cancelLeaveRequestSchema = z.object({
  id: z.string().uuid('معرف طلب الإجازة غير صحيح'),
  cancellationReason: z.string().max(1000, 'سبب الإلغاء يجب ألا يتجاوز 1000 حرف').optional()
});

export type CancelLeaveRequestFormValues = z.infer<
  typeof cancelLeaveRequestSchema
>;

export const interruptLeaveRequestSchema = z.object({
  id: z.string().uuid('معرف طلب الإجازة غير صحيح'),
  interruptionDate: z.string().min(1, 'تاريخ قطع الإجازة مطلوب'),
  returnDate: z.string().min(1, 'تاريخ العودة مطلوب'),
  interruptionType: z.number().int().min(1).max(2),
  reason: z.string().max(1000, 'السبب يجب ألا يتجاوز 1000 حرف').optional()
}).refine(
  (data) => {
    if (data.interruptionDate && data.returnDate) {
      return new Date(data.returnDate) >= new Date(data.interruptionDate);
    }
    return true;
  },
  {
    message: 'تاريخ العودة يجب أن يكون بعد تاريخ قطع الإجازة',
    path: ['returnDate']
  }
);

export type InterruptLeaveRequestFormValues = z.infer<
  typeof interruptLeaveRequestSchema
>;

// Status label configuration for UI display
export const statusLabels: Record<
  LeaveRequestStatus,
  {
    label: string;
    variant: 'default' | 'destructive' | 'outline' | 'secondary';
  }
> = {
  [LeaveRequestStatus.Draft]: {
    label: LeaveRequestStatusDisplay[LeaveRequestStatus.Draft],
    variant: 'outline'
  },
  [LeaveRequestStatus.PendingApproval]: {
    label: LeaveRequestStatusDisplay[LeaveRequestStatus.PendingApproval],
    variant: 'default'
  },
  [LeaveRequestStatus.Approved]: {
    label: LeaveRequestStatusDisplay[LeaveRequestStatus.Approved],
    variant: 'default'
  },
  [LeaveRequestStatus.Rejected]: {
    label: LeaveRequestStatusDisplay[LeaveRequestStatus.Rejected],
    variant: 'destructive'
  },
  [LeaveRequestStatus.Cancelled]: {
    label: LeaveRequestStatusDisplay[LeaveRequestStatus.Cancelled],
    variant: 'secondary'
  },
  [LeaveRequestStatus.Interrupted]: {
    label: LeaveRequestStatusDisplay[LeaveRequestStatus.Interrupted],
    variant: 'outline'
  },
  [LeaveRequestStatus.Completed]: {
    label: LeaveRequestStatusDisplay[LeaveRequestStatus.Completed],
    variant: 'default'
  }
};

// Helper to get status text for display
export const getLeaveRequestStatusText = (status: number): string => {
  return statusLabels[status as LeaveRequestStatus]?.label || 'غير معروف';
};

// Helper to check if a leave request can be edited
export const canEditLeaveRequest = (status: number): boolean => {
  return (
    status === LeaveRequestStatus.Draft ||
    status === LeaveRequestStatus.PendingApproval
  );
};

// Helper to check if a leave request can be cancelled
export const canCancelLeaveRequest = (status: number): boolean => {
  return status === LeaveRequestStatus.Approved;
};

// Format date for display
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'غير متوفر';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
  } catch (error) {
    return 'تاريخ غير صحيح';
  }
};

